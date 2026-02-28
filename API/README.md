# API

Swagger URL: http://localhost:5000/swagger/index.html

## Commands
```sh
cd StreamTrack/API
```

#### Use the Reset DB script
```sh
./resetPostgreSQLDB.sh
```

#### Add new migration
```sh
dotnet ef migrations add MIGRATION_NAME -o Migrations
```

#### If NOT updated database yet
```sh
dotnet ef migration remove
```

#### How to print the migrations schema
```sh
dotnet ef migrations script
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

## AWS EC2 Server with Docker
* Ubuntu Server 24.04 LTS (HVM), SSD Volume Type
* 64-bit ARM!
* EC2 t4g.micro (~6-7$ a month) or small (2x the cost)
* Key pair
    * stream_track_key.pem
    * Download and move it to ~/.ssh
    * chmod 400 stream_track_key.pem (read only)
* Security Group:
    * HTTP (Caddy needs for cert management) port 80 open 0.0.0.0/0
    * HTTPS port 443 open 0.0.0.0/0
    * SSH port 22 (either restrict to ur PUBLIC ipv4/32 or allow 0.0.0.0/0, but thats probably a bad idea)
* 16 GB (we need it)
* IAM Role/Instance Profile
    * Need permissions for SecretsManager and EC2


SSH into the EC2 instance (need to setup ur ~/.ssh/config for this short version)
```sh
ssh StreamTrack
```
or add this to ~/.ssh/config on LOCAL
```
Host StreamTrack
  HostName {EC2_IP_Address}
  User ubuntu
  IdentityFile ~/.ssh/stream_track_key.pem
  PubkeyAuthentication yes
```

Update
```sh
sudo apt-get update
```

Get JQ (like sed but for json)
```sh
sudo apt-get install -y jq unzip
jq --version
```

Get AWS CLI
```sh
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "/tmp/awscliv2.zip"
unzip /tmp/awscliv2.zip -d /tmp
sudo /tmp/aws/install
aws --version
```

Check AWS permissions (instance should already have been given a role with the correct permissions for SecretsManager and EC2)
```sh
aws sts get-caller-identity
```

Docker
```sh
sudo apt-get install -y docker.io
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER  # So you can run docker without sudo (logout/login required)
```

Check Docker
```sh
docker --version
```

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
git clone -b dev git@github.com:Albro3459/StreamTrack.git # -b dev for dev branch
# Optional for space saving: rm -rf StreamTrack/API StreamTrack/Lambda
```

### Docker

Ready to run!
```sh
cd StreamTrack/API/Docker
```

DockerScript.sh is the main script, which when called in the EC2 instance will run everything else.

##### RUN FROM INSIDE THE Docker/ DIRECTORY!
Make sure Database Update command is uncommented!
```sh
./DockerScript.sh
```

To Stop and Start again:
```sh
docker compose stop
docker compose start db api caddy
```

To fully cleanup and stop containers (requires full rebuild):
```sh
docker compose down
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

##### Extras :)

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
