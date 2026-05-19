# API

Swagger URL: http://localhost:5000/swagger/index.html

## Commands
```sh
cd StreamTrack/API
```

**NOTE**: For Docker commands, you have to be in the Docker directory and you should only run these commands from the docker directory anyway.

#### Make a DB backup!
* Please make a backup before any database changes
* On the server, use [BackupDB](./Docker/BackupDB.sh) to make the backup.
```sh
cd Docker
./BackupDB.sh
```

#### Get a DB backup copy locally
* See [BackupAndDownloadDB](./Docker/BackupAndDownloadDB.md) for the server backup and `scp` flow.

#### To build the server or apply updated or a new migration:
* See [DockerScript](./Docker/DockerScript.sh)
    * May need to uncomment certain commands to run migrations or API/Caddy updates
* NOTE: Make a backup first: [Backup!](#make-a-db-backup)
```sh
cd Docker
./DockerScript.sh
```

#### Use the Reset DB script ()
* NOTE: Make a backup first: [Backup!](#make-a-db-backup)
```sh
cd Docker
./resetPostgreSQLDB.sh
```

#### Create new migration (does not apply it)
* NOTE: Make a backup first: [Backup!](#make-a-db-backup)
```sh
cd Docker
dotnet ef migrations add MIGRATION_NAME -o Migrations
```

#### Apply new migration
* NOTE: Make a backup first: [Backup!](#make-a-db-backup)
* NOTE: Please make sure the migration does not delete data unintentionally or irreversibly. 
    * You can add sql scripts to Up and Down for this. See the [NormalizePosters Migration](./Migrations/20260227144325_NormalizePosters.cs)
* Uncomment the lines about building the migrate service and running the migrate service
```sh
cd Docker
./DockerScript.sh
```

#### If NOT updated database yet or want to undo a migration
* NOTE: Make a backup first: [Backup!](#make-a-db-backup)
```sh
cd Docker
dotnet ef migration remove
```

#### How to extract the migrations schema!
* NOTE: Make a backup first: [Backup!](#make-a-db-backup)
```sh
cd Docker
dotnet ef migrations script > out.txt
```

## PostgreSQL

#### Start background service
```sh
brew services start postgresql@14
```

#### Open postgres shell
```sh
psql postgres
```

```SQL
CREATE USER username WITH PASSWORD '...';
CREATE DATABASE "StreamTrack" OWNER username;
GRANT ALL PRIVILEGES ON DATABASE "StreamTrack" TO username;
\q
```

# Check OCI locally
```sh
oci iam region list --config-file /Users/alexbrodsky/.oci/config --profile DEFAULT --auth security_token
```

## OCI VM Server with Docker
* Ubuntu Server 24.04 LTS
* Ampere A1 (VM.Standard.A1.Flex | 64-bit ARM | 1 OCPU | 6 GB RAM)
* 16 GB (we need it)
* SSH Key pair
    * stream_track_key.pem
    * Download and move it to ~/.ssh
    * chmod 400 stream_track_key.pem (read only)
* OCI VCN / Security Rules:
    * TCP `80` open to `0.0.0.0/0` for HTTP (Caddy needs for cert management)
    * TCP `443` open to `0.0.0.0/0` for HTTPS
    * TCP `22` restricted to your own public IP/32 whenever possible for SSH
* OCI IAM / Dynamic Group / Policy:
    * Allow the VM's instance principal to read the required Vault secrets
* DNS:
    * Point `streamtrack.gocloudlaunch.com` at the VM public IP before bringing up Caddy

SSH into the OCI instance
```sh
ssh StreamTrack
```
or add this to `~/.ssh/config` on local
```sh
Host StreamTrack
  HostName {OCI_VM_PUBLIC_IP}
  User ubuntu
  IdentityFile ~/.ssh/stream_track_key.pem
  PubkeyAuthentication yes
```

Update packages
```sh
sudo apt-get update
```

Install ripgrep
```sh
sudo apt-get install -y ripgrep
```

Install OCI CLI
* Choose the default for all the paths (press Enter)
* YES to adding `oci` to the $PATH in `~/.bashrc`
```sh
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

Source and verify
```sh
source ~/.bashrc
oci --version
```

Verify instance principal access
```sh
oci iam region-subscription list --auth instance_principal --tenancy-id <your_tenancy_ocid>
```

Docker
```sh
sudo apt-get install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER  # So you can run docker without sudo
newgrp docker
```

Check Docker
```sh
docker ps
docker --version
```

May need to logout and log back in for docker to have sudo access

Docker Compose
```sh
sudo mkdir -p /usr/local/libexec/docker/cli-plugins
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64" -o /usr/local/libexec/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/libexec/docker/cli-plugins/docker-compose
```

Check Docker Compose
```sh
docker compose version
```

Setup Git
```sh
cd ~/.ssh
ssh-keygen -t ed25519 -C "brodsky.alex22@gmail.com" -f stream_track_key # No passphrase
nano config
```

Paste this
```sh
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/stream_track_key
    IdentitiesOnly yes
```

```sh
cat stream_track_key.pub
```

Then copy that full key to ur GitHub in Settings > SSH and GPG keys
Click "New SSH Key", title it stream_track_key, keep "Authentication Key" and paste that pub key u copied.

Then test the GitHub connection (keep git as the username):
```sh
ssh -T git@github.com
```

Then run:
```sh
git config --global user.name "albro3459"
git config --global user.email "brodsky.alex22@gmail.com"
```

Then u are good, but make sure u clone with the SSH version not the https version like:
```sh
cd ~
git clone -b oracle git@github.com:Albro3459/StreamTrack.git # -b oracle for oracle branch
# Optional for space saving: rm -rf StreamTrack/API StreamTrack/Lambda
```

### Docker

Ready to run!
```sh
cd StreamTrack/API/Docker
```

Set `SECRET_OCID` in `API/Docker/.env`.
```sh
echo "SECRET_OCID=ocid1.vaultsecret.oc1.us-sanjose-1.amaaaaaa2dnnktiai776n2nf2ge6lxim2kslh5mpi7yddnwzbw75pc2gqtta" >> .env
```

`SECRET_OCID` is the OCI identifier for the Vault secret object, not the secret payload itself. It should point to one OCI Vault secret containing:
```json
{
  "PostgresUsername": "...",
  "PostgresPassword": "...",
  "LambdaUID": "...",
  "RapidAPIKey_Main": "...",
  "TMDBBearerToken": "..."
}
```

`DockerScript.sh` is the main script. It pulls the StreamTrack JSON secret from OCI Vault with the VM instance principal, reads the Postgres credentials from that JSON, then starts Docker Compose.
`OCI_REGION` is committed in the Docker config as `us-sanjose-1`.

The Caddy container is now built from `Caddy.Dockerfile` so it includes the rate limiting module used by `Caddyfile`.

##### RUN FROM INSIDE THE Docker/ DIRECTORY!

Read the actual script first to see what to comment or uncomment
For initial migration, make sure Database Update command is uncommented!
```sh
./DockerScript.sh
```

To Stop and Start again:
```sh
docker compose stop
docker compose start db api caddy
```

To fully cleanup and stop containers (requires full rebuild):
* NOTE: NEVER run `docker compose down -v`, this will literally delete the database!!!
```sh
docker compose down
```

#### Security Upgrades

Disable ssh with password and root login over ssh:

Backup `sshd_config`
```sh
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%F_%H-%M-%S)
```

Check current settings
```sh
sudo sed -n '1,220p' /etc/ssh/sshd_config | rg -n "PasswordAuthentication|PermitRootLogin"
```

Turn them off
```sh
echo 'PasswordAuthentication no' | sudo tee -a /etc/ssh/sshd_config &&
echo 'PermitRootLogin no' | sudo tee -a /etc/ssh/sshd_config
```

Reload ssh and verify
```sh
sudo sshd -t &&
sudo systemctl reload ssh &&
sudo sshd -T | rg 'passwordauthentication|permitrootlogin'
```

Expected result:
```sh
permitrootlogin no
passwordauthentication no
```

Add `fail2ban`:

Update and install
```sh
sudo apt-get update &&
sudo apt-get install -y fail2ban
```

Create local jail config
```sh
sudo tee /etc/fail2ban/jail.d/sshd.local > /dev/null << 'EOF'
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = systemd
maxretry = 5
findtime = 10m
bantime = 1h
EOF
```

Start + enable
```sh
sudo systemctl enable fail2ban &&
sudo systemctl restart fail2ban &&
sudo systemctl status fail2ban --no-pager
```

Verify jail is active
```sh
sudo fail2ban-client status &&
sudo fail2ban-client status sshd
```

#### Debugging
Check if API is running
```sh
docker compose ps
```

Check logs
```sh
docker compose logs caddy
docker compose logs api
```
or to stream
```sh
docker compose logs -f api
```

If you get a 404 for secrets in the VM, you probably don't have the permissions:
* Create Dynamic Group:
    * Identity & Security -> Domains -> Default
    * Dynamic Groups tab
    * Create dynamic group
    * Name: `StreamTrack`
    * Match any rules
    * Rule: ALL {instance.id = `<your_instance_ocid>`}
* Add a Policy:
    * Identity & Security -> Policies (the one under Identity, not Network)
    * Create Policy
    * Name: `StreamTrack`
    * **Capitals Matter**:
        * `Allow dynamic-group StreamTrack to read secret-family in tenancy`
        * `StreamTrack` needs to **exactly** match your Dynamic Group


##### Extras :)

###### DB Connection:
You can connect to the DB through SSH with Data Grip (and probably other DB tools) after setting up the Host in `~/.ssh/config`
Or
Query PostgreSQL from inside server:
Postgres container has to be running. 
Find its name (typically docker-db-1):
```sh
cd ~/StreamTrack/API/Docker
docker ps
```

Open a psql shell inside your running Postgres container:
```sh
docker exec -it docker-db-1 psql -U {POSTGRES_USER} -d {POSTGRES_DB}
```

Tips:
**\q** to exit, **\d** to list tables, **\l** to list db,
**\d tablename** to describe a table
Also, wrap names in "...":
```sql
Select * from "Genre";
```

Creating a swap file (just in case)

First, check if swap is on:
```sh
sudo swapon --show
```

If not, then:
```sh
sudo fallocate -l 1G /swapfile # 1 GB or Virtual Memory
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

Verify
```sh
sudo swapon --show
```

If everything looks good, make it permanent for reboots:
```sh
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
