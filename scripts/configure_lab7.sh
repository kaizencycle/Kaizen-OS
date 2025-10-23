#!/bin/bash

# Lab7-Proof GitHub Configuration Script
# This script sets up GitHub repository variables and secrets for Lab7 PAL deploys

set -e

# Configuration
REPO_OWNER="kaizencycle"
REPO_NAME="lab7-proof"
GITHUB_TOKEN="YOUR_GITHUB_PERSONAL_ACCESS_TOKEN"

# Service IDs (will be set as GitHub variables)
BACKEND_SVC=""
FRONTEND_SVC=""
RENDER_KEY=""
AUTOLABEL_TOKEN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --backend-service-id)
      BACKEND_SVC="$2"
      shift 2
      ;;
    --frontend-service-id)
      FRONTEND_SVC="$2"
      shift 2
      ;;
    --render-api-key)
      RENDER_KEY="$2"
      shift 2
      ;;
    --github-token)
      AUTOLABEL_TOKEN="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --backend-service-id ID    Set LAB7_BACKEND_SERVICE_ID"
      echo "  --frontend-service-id ID   Set LAB7_FRONTEND_SERVICE_ID"
      echo "  --render-api-key KEY       Set LAB7_RENDER_API_KEY secret"
      echo "  --github-token TOKEN       Set LAB7_AUTOLABEL_TOKEN secret"
      echo "  --help                     Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check if GitHub token is provided
if [[ -z "$GITHUB_TOKEN" || "$GITHUB_TOKEN" == "YOUR_GITHUB_PERSONAL_ACCESS_TOKEN" ]]; then
  echo "Error: Please set GITHUB_TOKEN environment variable or provide --github-token"
  echo "Get your token from: https://github.com/settings/tokens"
  exit 1
fi

# Function to set GitHub variable
set_github_variable() {
  local name="$1"
  local value="$2"
  
  echo "Setting GitHub variable: $name"
  
  curl -X PATCH \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/variables/$name" \
    -d "{\"name\":\"$name\",\"value\":\"$value\"}" \
    2>/dev/null || \
  curl -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/variables" \
    -d "{\"name\":\"$name\",\"value\":\"$value\"}" \
    2>/dev/null
}

# Function to set GitHub secret
set_github_secret() {
  local name="$1"
  local value="$2"
  
  echo "Setting GitHub secret: $name"
  
  # Get repository public key
  local key_response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key")
  
  local key_id=$(echo "$key_response" | jq -r '.key_id')
  local key=$(echo "$key_response" | jq -r '.key')
  
  # Encrypt the secret value
  local encrypted_value=$(echo -n "$value" | openssl enc -base64 -A | openssl rsautl -encrypt -pubin -inkey <(echo "$key" | base64 -d) | base64 -w 0)
  
  # Set the secret
  curl -X PUT \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/$name" \
    -d "{\"encrypted_value\":\"$encrypted_value\",\"key_id\":\"$key_id\"}" \
    2>/dev/null
}

# Set variables if provided
if [[ -n "$BACKEND_SVC" ]]; then
  set_github_variable "LAB7_BACKEND_SERVICE_ID" "$BACKEND_SVC"
fi

if [[ -n "$FRONTEND_SVC" ]]; then
  set_github_variable "LAB7_FRONTEND_SERVICE_ID" "$FRONTEND_SVC"
fi

# Set secrets if provided
if [[ -n "$RENDER_KEY" ]]; then
  set_github_secret "LAB7_RENDER_API_KEY" "$RENDER_KEY"
fi

if [[ -n "$AUTOLABEL_TOKEN" ]]; then
  set_github_secret "LAB7_AUTOLABEL_TOKEN" "$AUTOLABEL_TOKEN"
fi

echo "Configuration complete!"
echo "Check your repository settings at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/variables/actions"
