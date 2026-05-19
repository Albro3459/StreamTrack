# Backup and Download the StreamTrack DB

Use this when you want to make a PostgreSQL backup on the StreamTrack server and copy it back to your Mac.

## Make the Backup on the Server

SSH into the server:

```sh
ssh streamtrack
```

Go to the Docker directory:

```sh
cd ~/StreamTrack/API/Docker
```

Run the backup script:

```sh
./BackupDB.sh
```

The script prints the full backup path at the end, like:

```text
Backup saved to /home/ubuntu/StreamTrack/API/Docker/backups/streamtrack_2026-05-19_15-23-44.sql
```

Copy that full file path.

Exit the server:

```sh
exit
```

## Copy the Backup to Your Mac

Go to the local Docker directory:

```sh
cd ~/GitHub/StreamTrack/API/Docker
```

Make sure the local backup folder exists:

```sh
mkdir -p backups
```

Copy the backup from the server, replacing the path with the one printed by `BackupDB.sh`:
```sh
scp streamtrack:~/StreamTrack/API/Docker/backups/streamtrack_2026-05-19_15-23-44.sql ~/GitHub/StreamTrack/API/Docker/backups/
```

If `scp` looks stuck, it may just be copying without progress output. Add `-v` for connection details or use `rsync` for progress:
* Note `rsync` must be installed on both the VM and local Mac
```sh
rsync -avP streamtrack:/home/ubuntu/StreamTrack/API/Docker/backups/streamtrack_2026-05-19_15-23-44.sql ./backups/
```
