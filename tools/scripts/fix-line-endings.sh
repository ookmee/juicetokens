#!/bin/bash

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fix line endings and remove hidden characters
fix_file() {
    local file="$1"
    log "Fixing $file..."
    
    # Convert to Unix line endings and remove any hidden characters
    tr -d '\r' < "$file" > "${file}.tmp"
    mv "${file}.tmp" "$file"
    
    # Make sure the file is executable
    chmod +x "$file"
}

# Fix all shell scripts in the tools/scripts directory
log "Fixing shell scripts..."
for script in tools/scripts/*.sh; do
    if [ -f "$script" ]; then
        fix_file "$script"
    fi
done

log "All scripts have been fixed!" 