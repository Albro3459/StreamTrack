# CloudFlare

Cloudflare-side artifacts for StreamTrack: the **Origin CA certificate** the origin Caddy serves
so that `streamtrack.gocloudlaunch.com` only accepts traffic through Cloudflare, plus
**Authenticated Origin Pulls** (mTLS) and an OCI security list that only admits Cloudflare IPs on 443.

Real cert/key/zone files never touch git - the committed `example.*` files are templates. The
canonical copies live here (gitignored) and are flattened into the **OCI Vault** secret;
[DockerScript.sh](../API/Docker/DockerScript.sh) writes the runtime copies to `API/Docker/certs/` at
deploy time. **Never commit the real certificate, private key, or zone export.**

## Files

* `cloud-gateway.pem` (gitignored) - the real Cloudflare **Origin CA certificate** for
  `gocloudlaunch.com, *.gocloudlaunch.com`. The wildcard covers `streamtrack.gocloudlaunch.com`, so
  this is the **same cert the CloudGateway repo uses** - one Origin CA cert serves the whole zone.
* `cloud-gateway.key` (gitignored) - the Origin CA **private key**. Secret.
* `gocloudlaunch.com.txt` (gitignored) - export/backup of the Cloudflare DNS zone (BIND format).
* `example.cloud-gateway.pem` / `example.cloud-gateway.key` - committed placeholder cert/key.
* `example.gocloudlaunch.com.txt` - committed example of the DNS record set.

> Naming note: the canonical files keep the `cloud-gateway.*` name because they're literally the
> shared zone cert. At runtime [DockerScript.sh](../API/Docker/DockerScript.sh) writes them out as
> `origin.pem` / `origin.key` under `API/Docker/certs/` (the names the Caddyfile expects).

## Why this exists

`streamtrack.gocloudlaunch.com` is proxied (orange-cloud), so Cloudflare terminates TLS at the
edge and opens a **second TLS hop** to the origin. The zone is **Full (strict)**, so the origin
must present a cert Cloudflare trusts.

A proxied hostname resolves to Cloudflare, not the host, so the origin can **never** get a public
cert via ACME (Let's Encrypt HTTP-01/TLS-ALPN-01 challenges never reach it). The fix is a
Cloudflare **Origin CA** cert: Cloudflare issues it directly with no inbound challenge and its
edge trusts it in Full (strict). The origin stays locked to Cloudflare (firewall + AOP), so none
of the edge protections (DDoS, rate limiting, Bot Fight Mode) are bypassed.

## The three runtime files and their roles

At deploy the cert/key plus the public origin-pull CA land in `API/Docker/certs/`, mounted into
Caddy at `/etc/caddy/certs/`:

| File | Has a private key? | Role |
|---|---|---|
| `origin.pem` | - (public cert) | The server cert Caddy **presents** to Cloudflare to prove its identity. |
| `origin.key` | **yes (secret)** | Proves Caddy actually **owns** `origin.pem`. Used to complete the TLS handshake. |
| `cloudflare-origin-pull-ca.pem` | no (public CA) | The CA Caddy uses to **verify** the client cert Cloudflare presents (the AOP/mTLS direction). |

### Why the origin needs *both* the cert and the key

Standard TLS server authentication:

- `origin.pem` is **public** - Caddy hands it to every client (Cloudflare's edge). It just says
  "here's my identity, signed by Cloudflare's Origin CA." Anyone can copy a public cert, so on its
  own it proves nothing.
- `origin.key` is the matching **private key**, and Caddy never sends it. During the handshake
  Caddy uses it to **prove it's the legitimate holder** of `origin.pem` (it signs handshake data /
  completes the key exchange). Being the only party with the key is what makes the cert *yours*.

Lose the key -> Caddy can't terminate TLS. Leak the key -> someone can impersonate the origin.

### Why the origin-pull CA has no key (the asymmetry)

You only need a private key when **you** are the one being authenticated.

- `origin.pem` + `origin.key` -> Caddy **proving** itself *to* Cloudflare -> needs the private key.
- `cloudflare-origin-pull-ca.pem` -> Caddy **verifying** Cloudflare's client cert -> public CA only.

Cloudflare holds the private key for *its* side of the mTLS; you never see it. So: two files with a
key (your server identity), one without (verifying Cloudflare).

## Generating / obtaining the Origin CA certificate

The cert is already here (`cloud-gateway.pem` / `cloud-gateway.key`), reused from CloudGateway since
it's the shared `*.gocloudlaunch.com` wildcard. To regenerate from scratch:

Cloudflare dashboard -> **SSL/TLS -> Origin Server -> Create Certificate**:

- Hostnames: `gocloudlaunch.com, *.gocloudlaunch.com` (the wildcard covers `streamtrack.gocloudlaunch.com`).
- Validity: 15 years. Format: PEM.

Save the certificate to `cloud-gateway.pem` and the private key (shown only once) to
`cloud-gateway.key` in this folder. One cert covers the whole zone (StreamTrack **and** CloudGateway).

## Flattening the keys into the OCI Vault secret JSON

The cert and key are multi-line PEM, but the OCI Vault secret is a single JSON blob, so the
newlines must be escaped to `\n` to live inside a JSON string field (same treatment as the
Firebase private key already in the secret). Two ways:

### Option A - merge straight into the secret JSON (recommended)

`jq --rawfile` reads a file as a raw string and JSON-encodes it (escaping newlines) on assignment.
Run from this folder:

```bash
# pull the current secret to a local file (us-sanjose-1)
oci secrets secret-bundle get --secret-id "$SECRET_OCID" --profile sanjose \
  --query 'data."secret-bundle-content".content' --raw-output \
  | base64 --decode > secret.json

# add the two cert fields (newlines auto-escaped to \n)
jq --rawfile cert cloud-gateway.pem --rawfile key cloud-gateway.key \
   '.CaddyOriginCert = $cert | .CaddyOriginKey = $key' \
   secret.json > secret.new.json

# upload as a NEW secret version
oci vault secret update-base64 --secret-id "$SECRET_OCID" --profile sanjose \
  --secret-content-content "$(base64 -i secret.new.json)"

# clean up local plaintext
trash secret.json secret.new.json
```

### Option B - flatten by hand for the console editor

If you're pasting into the OCI console secret editor, get each escaped JSON string with:

```bash
jq -Rs . < cloud-gateway.pem   # -> paste as the value of "CaddyOriginCert"
jq -Rs . < cloud-gateway.key   # -> paste as the value of "CaddyOriginKey"
```

`jq -Rs .` (Raw input, Slurp) reads the whole file and emits one JSON string literal with the
newlines escaped and surrounding quotes included.

Either way the secret ends up with:

```json
"CaddyOriginCert": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----\n",
"CaddyOriginKey":  "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

The API ignores fields it doesn't use, so adding these to the shared secret is harmless.

## How it reaches the host on deploy

[DockerScript.sh](../API/Docker/DockerScript.sh) already fetches the secret bundle from OCI Vault.
Before starting Caddy (skipped when `LOCAL_API=true`) it:

1. `jq -r .CaddyOriginCert` -> `certs/origin.pem`, `.CaddyOriginKey` -> `certs/origin.key`
   (`jq -r` turns the `\n` back into real newlines), with `644` / `600` perms.
2. Curls the public origin-pull CA -> `certs/cloudflare-origin-pull-ca.pem` (only if missing).
3. `docker compose up -d api caddy`.

[docker-compose.yml](../API/Docker/docker-compose.yml) mounts `./certs` read-only into Caddy at
`/etc/caddy/certs`, and [Caddyfile](../API/Docker/Caddyfile) serves them via `tls` + `client_auth`
(`require_and_verify`). Rotating the cert = update the Vault secret and redeploy. If Caddy doesn't
pick up changes, force it: `docker compose up -d --force-recreate caddy`.

## Required Cloudflare zone settings

1. **SSL/TLS -> Overview -> encryption mode = `Full (strict)`.**
2. **SSL/TLS -> Origin Server -> Create Certificate** for `gocloudlaunch.com, *.gocloudlaunch.com`
   (PEM, 15 yr) - the server cert above. *Not* an AOP cert.
3. **SSL/TLS -> Origin Server -> Authenticated Origin Pulls -> turn on both Global and Zone-level.
   Do NOT upload any certificate to Zone-level.** The host trusts Cloudflare's shared client cert
   via the origin-pull CA at `/etc/caddy/certs/cloudflare-origin-pull-ca.pem`.

## DNS records

The `gocloudlaunch.com` zone is **shared with CloudGateway**. See `example.gocloudlaunch.com.txt`
for the record set; the StreamTrack-relevant entry is:

* `streamtrack.gocloudlaunch.com` -> origin public IPv4, **proxied** (orange) - the API.

The app itself is a React Native build distributed via the App Store, so it has no frontend DNS.

## Firewall (OCI security list)

The other half of "Cloudflare only" is the subnet security list: 443 admitted **only** from
Cloudflare CIDRs, port 80 dropped, no UDP, SSH kept for admin IPs. Template:
[../OCI/example.subnet-security-list.json](../OCI/example.subnet-security-list.json). The real list
is pulled/applied with `oci network security-list` and is gitignored.

## Cutover order (avoid self-lockout)

The Caddyfile **requires** the cert to exist, and the firewall must not close before the edge can
still reach the origin. Do it in this order:

1. Put `CaddyOriginCert` / `CaddyOriginKey` in the Vault secret (above).
2. Deploy: `./DockerScript.sh` - Caddy comes up serving the Origin CA cert.
3. Cloudflare: set **Full (strict)** + enable **AOP**. Verify the site still serves through the edge.
4. **Then** apply the locked security list. Verify again, and confirm a direct-to-origin hit now fails.

Keep an SSH rule for your own IP in the security list the whole time - it's the recovery path.
