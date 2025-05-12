#!/bin/bash

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to validate the deployment directory
validate_deploy_dir() {
    local dir="$1"
    
    # Check if directory exists
    if [ ! -d "$dir" ]; then
        log "Error: Deployment directory $dir does not exist"
        return 1
    }
    
    # Check if directory is writable
    if [ ! -w "$dir" ]; then
        log "Error: Deployment directory $dir is not writable"
        return 1
    }
    
    # Check if we're in the juicetokens directory
    if [ ! -f "$dir/package.json" ]; then
        log "Error: Not a valid juicetokens directory (package.json not found)"
        return 1
    }
    
    return 0
}

# Function to validate Docker installation
validate_docker() {
    if ! command -v docker &> /dev/null; then
        log "Error: Docker is not installed"
        return 1
    }
    
    if ! command -v docker-compose &> /dev/null; then
        log "Error: Docker Compose is not installed"
        return 1
    }
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log "Error: Docker daemon is not running"
        return 1
    }
    
    return 0
}

# Function to validate environment variables
validate_env() {
    local required_vars=("GRAFANA_PASSWORD")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log "Warning: The following environment variables are not set:"
        for var in "${missing_vars[@]}"; do
            log "  - $var"
        done
        log "Some features may not work correctly"
    fi
}

# Function to validate Docker compose file
validate_compose_file() {
    local compose_file="$1"
    
    if [ ! -f "$compose_file" ]; then
        log "Error: Docker compose file not found: $compose_file"
        return 1
    fi
    
    # Validate the compose file
    if ! docker-compose -f "$compose_file" config &> /dev/null; then
        log "Error: Invalid Docker compose file: $compose_file"
        return 1
    fi
    
    return 0
}

# Function to check if running as root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log "Error: This script should not be run as root"
        return 1
    fi
    return 0
}

# Function to validate the current directory
validate_current_dir() {
    local expected_dir="$1"
    local current_dir=$(pwd)
    
    if [ "$current_dir" != "$expected_dir" ]; then
        log "Error: Script must be run from $expected_dir"
        log "Current directory: $current_dir"
        return 1
    fi
    
    return 0
} 