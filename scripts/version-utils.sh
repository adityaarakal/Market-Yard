#!/bin/bash

# ============================================================================
# VERSION UTILITY FUNCTIONS
# ============================================================================
# Utility functions for version management

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_FILE="$REPO_ROOT/VERSION.txt"

# Source OS detection utility
if [ -f "$(dirname "${BASH_SOURCE[0]}")/detect-os.sh" ]; then
  source "$(dirname "${BASH_SOURCE[0]}")/detect-os.sh"
else
  # Fallback OS detection if detect-os.sh not available
  detect_os() {
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ -n "$WINDIR" ]]; then
      echo "windows"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      echo "macos"
    else
      echo "unix"
    fi
  }
fi

# Convert Unix-style path to Windows path if on Windows
# NOTE: This function ONLY converts paths on Windows. On Mac/Linux, paths are returned as-is.
convert_path_for_node() {
  local path="$1"
  local current_os=$(detect_os)
  
  # Only convert paths on Windows (Git Bash on Windows uses /c/... format)
  if [[ "$current_os" == "windows" ]]; then
    # Convert /c/Users/... to C:/Users/... (Node.js on Windows accepts forward slashes)
    if [[ "$path" =~ ^/([a-zA-Z])/(.*)$ ]]; then
      local drive="${BASH_REMATCH[1]}"
      local rest="${BASH_REMATCH[2]}"
      echo "${drive^^}:/${rest}"
    else
      echo "$path"
    fi
  else
    # On Mac/Linux, return path as-is (no conversion needed)
    echo "$path"
  fi
}

# Get current version from package.json
get_current_version() {
  if [ -f "$REPO_ROOT/package.json" ]; then
    # Convert path for Node.js on Windows (ONLY on Windows)
    local current_os=$(detect_os)
    if [[ "$current_os" == "windows" ]]; then
      local node_path=$(convert_path_for_node "$REPO_ROOT/package.json")
      node -p "require('$node_path').version"
    else
      # On Mac/Linux, use path directly (no conversion needed)
      node -p "require('$REPO_ROOT/package.json').version"
    fi
  elif [ -f "$VERSION_FILE" ]; then
    cat "$VERSION_FILE"
  else
    echo "0.0.0"
  fi
}

# Parse version into parts
parse_version() {
  local version=$1
  echo "$version" | awk -F. '{print $1" "$2" "$3}'
}

# Increment version parts
increment_major() {
  local version=$1
  local parts=($(parse_version "$version"))
  echo "$((parts[0] + 1)).0.0"
}

increment_minor() {
  local version=$1
  local parts=($(parse_version "$version"))
  echo "${parts[0]}.$((parts[1] + 1)).0"
}

increment_patch() {
  local version=$1
  local parts=($(parse_version "$version"))
  echo "${parts[0]}.${parts[1]}.$((parts[2] + 1))"
}

# Validate version format
validate_version() {
  local version=$1
  if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Invalid version format: $version. Expected MAJOR.MINOR.PATCH"
    return 1
  fi
  return 0
}

# Compare two versions (returns 0 if v1 > v2, 1 otherwise)
# Usage: compare_versions "1.0.1" "1.0.0" -> returns 0 (true, v1 > v2)
compare_versions() {
  local v1=$1
  local v2=$2
  
  # Parse versions
  local v1_parts=($(parse_version "$v1"))
  local v2_parts=($(parse_version "$v2"))
  
  # Compare major
  if [ "${v1_parts[0]}" -gt "${v2_parts[0]}" ]; then
    return 0  # v1 > v2
  elif [ "${v1_parts[0]}" -lt "${v2_parts[0]}" ]; then
    return 1  # v1 < v2
  fi
  
  # Compare minor
  if [ "${v1_parts[1]}" -gt "${v2_parts[1]}" ]; then
    return 0  # v1 > v2
  elif [ "${v1_parts[1]}" -lt "${v2_parts[1]}" ]; then
    return 1  # v1 < v2
  fi
  
  # Compare patch
  if [ "${v1_parts[2]}" -gt "${v2_parts[2]}" ]; then
    return 0  # v1 > v2
  elif [ "${v1_parts[2]}" -lt "${v2_parts[2]}" ]; then
    return 1  # v1 < v2
  fi
  
  # Equal
  return 1  # v1 == v2, not greater than
}

# Set version in all files
set_version() {
  local new_version=$1
  
  if ! validate_version "$new_version"; then
    return 1
  fi
  
  echo "Setting version to $new_version..."
  
  # Update root package.json
  if [ -f "$REPO_ROOT/package.json" ]; then
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('$REPO_ROOT/package.json', 'utf8'));
      pkg.version = '$new_version';
      fs.writeFileSync('$REPO_ROOT/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
  fi
  
  # Update VERSION.txt
  echo "$new_version" > "$VERSION_FILE"
  
  echo "✅ Version set to $new_version"
}

# Export functions for use in other scripts
export -f get_current_version
export -f parse_version
export -f increment_major
export -f increment_minor
export -f increment_patch
export -f validate_version
export -f compare_versions
export -f set_version

