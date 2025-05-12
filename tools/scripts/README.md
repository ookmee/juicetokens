# Deployment Scripts

This directory contains scripts for managing the JuiceTokens deployment on the VPS.

## Deployment Location

All scripts assume the application is deployed in the user's home directory:
```bash
$HOME/juicetokens/
```

## Scripts Overview

### 1. `setup-vps.sh`
Initial server setup script. Run this only once when setting up a new VPS.

```bash
# Usage
./setup-vps.sh

# What it does:
- Creates directory structure in $HOME/juicetokens
- Copies Docker configuration files
- Sets up environment variables
- Installs Docker and Docker Compose
- Sets proper permissions
```

### 2. `transition-docker.sh`
Migrates from old Docker file structure to new one. Run this when updating from an older version.

```bash
# Usage
./transition-docker.sh

# What it does:
- Creates new directory structure
- Backs up existing Docker files
- Moves files to new locations
- Stops existing containers
- Cleans up old containers/images
- Starts containers with new config
```

### 3. `reset.sh`
Complete reset and rebuild of the Docker environment. Run this when you need a fresh start.

```bash
# Usage
./reset.sh

# What it does:
- Stops all containers
- Force removes remaining containers
- Cleans up Docker system
- Removes all images
- Rebuilds and starts containers
- Checks container status
```

### 4. `update-vps.sh`
One-command update of the entire deployment. This is the main script you'll use regularly.

```bash
# Usage
./update-vps.sh

# What it does:
- Force resets local changes
- Removes untracked files
- Pulls latest changes from main
- Makes scripts executable
- Runs transition script if needed
- Runs reset script
```

## Typical Workflow

1. **First-time Setup**:
   ```bash
   ./setup-vps.sh
   ```

2. **Regular Updates**:
   ```bash
   ./update-vps.sh
   ```

## Environment Variables

The scripts expect certain environment variables to be set:

- `GRAFANA_PASSWORD`: Password for Grafana admin user
  - Default: 'admin' if not set
  - Set it in your environment or .env file

## Error Handling

All scripts include:
- Proper error logging
- Timestamped messages
- Directory validation
- Error state recovery

## Backup and Safety

- `transition-docker.sh` creates backups before moving files
- Backups are stored in `docker_backup_YYYYMMDD_HHMMSS/`
- You can restore from backup if needed

## Logging

All scripts output detailed logs with timestamps:
```bash
[2024-05-12 20:13:28] Starting operation...
[2024-05-12 20:13:29] Operation completed
```

## Troubleshooting

If you encounter issues:

1. Check the logs:
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml logs -f
   ```

2. Verify environment variables:
   ```bash
   echo $GRAFANA_PASSWORD
   ```

3. Check container status:
   ```bash
   docker-compose -f docker/production/docker-compose.prod.yml ps
   ```

4. If needed, run reset:
   ```bash
   ./reset.sh
   ``` 