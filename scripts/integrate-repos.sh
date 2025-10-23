#!/bin/bash

# Civic OS Repository Integration Script
# This script integrates all kaizencycle repositories into the Civic OS monorepo

set -e

echo "🚀 Starting Civic OS Repository Integration..."

# Function to add repository as subtree
add_repo_as_subtree() {
    local repo_name=$1
    local repo_url=$2
    local target_path=$3
    local branch=${4:-main}
    
    echo "📦 Adding $repo_name to $target_path..."
    
    # Add remote
    git remote add $repo_name $repo_url || echo "Remote $repo_name already exists"
    
    # Fetch repository
    git fetch $repo_name
    
    # Add as subtree
    git subtree add --prefix=$target_path $repo_name $branch --squash
    
    echo "✅ Successfully added $repo_name"
}

# Create labs directory if it doesn't exist
mkdir -p labs

echo "🔬 Integrating Lab Repositories..."

# Lab Repositories
add_repo_as_subtree "lab4-proof" "https://github.com/kaizencycle/lab4-proof.git" "labs/lab4-proof"
add_repo_as_subtree "lab6-proof" "https://github.com/kaizencycle/lab6-proof.git" "labs/lab6-proof" 
add_repo_as_subtree "lab7-proof" "https://github.com/kaizencycle/lab7-proof.git" "labs/lab7-proof"

echo "📚 Integrating Core Packages..."

# Core Packages
add_repo_as_subtree "civic-protocol-core" "https://github.com/kaizencycle/Civic-Protocol-Core.git" "packages/civic-protocol-core"
add_repo_as_subtree "oaa-api-library" "https://github.com/kaizencycle/OAA-API-Library.git" "packages/oaa-api-library"
add_repo_as_subtree "civic-ai-specs" "https://github.com/kaizencycle/civic-ai-specs.git" "packages/civic-ai-specs"

echo "🎉 Repository integration completed!"
echo ""
echo "📋 Summary of integrated repositories:"
echo "  - labs/lab4-proof (from lab4-proof)"
echo "  - labs/lab6-proof (from lab6-proof)"
echo "  - labs/lab7-proof (from lab7-proof)"
echo "  - packages/civic-protocol-core (from Civic-Protocol-Core)"
echo "  - packages/oaa-api-library (from OAA-API-Library)"
echo "  - packages/civic-ai-specs (from civic-ai-specs)"
echo ""
echo "Next steps:"
echo "  1. Update package.json workspaces"
echo "  2. Update turbo.json configuration"
echo "  3. Update README.md"
echo "  4. Test all integrated components"
