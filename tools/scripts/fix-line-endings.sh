#!/bin/bash

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Fix line endings and remove hidden characters
fix_file() {
    local file="$1"
    log "Fixing $file..."
    
    # Create a backup
    cp "$file" "${file}.bak"
    
    # Convert to Unix line endings and remove any hidden characters
    tr -d '\r' < "$file" > "${file}.tmp"
    
    # Remove any BOM and other special characters
    sed -i '1s/^\xEF\xBB\xBF//' "${file}.tmp"
    sed -i 's/[^[:print:]\t\n]//g' "${file}.tmp"
    
    # Fix common syntax issues
    sed -i 's/}/fi/g' "${file}.tmp"
    sed -i 's/{/then/g' "${file}.tmp"
    
    # Move the fixed file back
    mv "${file}.tmp" "$file"
    
    # Make sure the file is executable
    chmod +x "$file"
    
    log "Created backup at ${file}.bak"
}

# Fix all shell scripts in the tools/scripts directory
log "Fixing shell scripts..."
for script in tools/scripts/*.sh; do
    if [ -f "$script" ]; then
        fix_file "$script"
    fi
done

log "All scripts have been fixed!"
log "If you encounter any issues, you can restore from the .bak files" 