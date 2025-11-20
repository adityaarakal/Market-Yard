#!/bin/bash

# ============================================================================
# OS DETECTION UTILITY
# ============================================================================
# Centralized OS detection for cross-platform compatibility
# Usage: source this file to get IS_WINDOWS, IS_MAC, IS_LINUX variables
# Or call detect_os() function directly

# Detect operating system
detect_os() {
    # Check for Windows (multiple methods for reliability)
    if [[ "$OSTYPE" == "msys" ]] || \
       [[ "$OSTYPE" == "cygwin" ]] || \
       [[ "$OSTYPE" == "win32" ]] || \
       [[ -n "$WINDIR" ]] || \
       [[ -n "$OS" && "${OS:0:7}" == "Windows" ]] || \
       [[ "$(uname -s 2>/dev/null)" == "MINGW"* ]] || \
       [[ "$(uname -s 2>/dev/null)" == "MSYS"* ]]; then
        echo "windows"
        return 0
    fi
    
    # Check for macOS
    if [[ "$OSTYPE" == "darwin"* ]] || \
       [[ "$(uname -s 2>/dev/null)" == "Darwin" ]]; then
        echo "macos"
        return 0
    fi
    
    # Check for Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]] || \
       [[ "$(uname -s 2>/dev/null)" == "Linux" ]]; then
        echo "linux"
        return 0
    fi
    
    # Default to Unix-like (should work for most cases)
    echo "unix"
    return 0
}

# Export OS detection result
DETECTED_OS=$(detect_os)

# Set boolean flags
if [[ "$DETECTED_OS" == "windows" ]]; then
    IS_WINDOWS=true
    IS_MAC=false
    IS_LINUX=false
elif [[ "$DETECTED_OS" == "macos" ]]; then
    IS_WINDOWS=false
    IS_MAC=true
    IS_LINUX=false
elif [[ "$DETECTED_OS" == "linux" ]]; then
    IS_WINDOWS=false
    IS_MAC=false
    IS_LINUX=true
else
    # Unix-like (assume not Windows)
    IS_WINDOWS=false
    IS_MAC=false
    IS_LINUX=false
fi

# Export for use in other scripts
export DETECTED_OS
export IS_WINDOWS
export IS_MAC
export IS_LINUX

