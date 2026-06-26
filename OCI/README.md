# OCI

See the API Readme [API/README.md](../API/README.md)

# Terraform (Stacks)

[https://cloud.oracle.com/resourcemanager/stacks?region=us-sanjose-1](https://cloud.oracle.com/resourcemanager/stacks?region=us-sanjose-1)

Create a Stack

Zip up the terraform folder

Upload that zip

Then every time you 'Apply', it makes a new instance with your keys setup already!

See [terraform.tfvars.example](./terraform/terraform.tfvars.example) for an example of `terraform.tfvars`. 
* File name must match **exactly**

**NOTE**
Oracle's UI sucks and you can't actually update the variables there. You have to zip the terraform folder and upload it again as a new version.

# Apply subnet security rules

Update `OCI/subnet-security-list.json`, then export the security list OCID:

```bash
export SECURITY_LIST_OCID="ocid1.securitylist.oc1.us-sanjose-1..."
```

Pull the current rules down from OCI:

```bash
oci network security-list get \
  --security-list-id "$SECURITY_LIST_OCID" \
  --profile sanjose \
  > OCI/subnet-security-list.json
```

This overwrites `OCI/subnet-security-list.json`.

Build the OCI CLI rule payloads from the JSON file:

```bash
python3 -c 'import json; d=json.load(open("OCI/subnet-security-list.json"))["data"]; json.dump(d["ingress-security-rules"], open("/tmp/st-ingress.json","w"), indent=2); json.dump(d["egress-security-rules"], open("/tmp/st-egress.json","w"), indent=2)'
```

Apply the rules:

```bash
oci network security-list update \
  --security-list-id "$SECURITY_LIST_OCID" \
  --ingress-security-rules file:///tmp/st-ingress.json \
  --egress-security-rules file:///tmp/st-egress.json \
  --profile sanjose
```

OCI replaces all existing ingress and egress rules. Confirm the prompt only after checking `OCI/subnet-security-list.json`.
