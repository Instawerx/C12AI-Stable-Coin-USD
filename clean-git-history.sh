#!/bin/bash

echo "Starting git history cleanup..."
echo "Repository size before cleanup:"
du -sh .git

echo ""
echo "Removing large files from git history..."

# Remove .terraform directories and files
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch "deploy/gcp/terraform/.terraform" "terraform/environments/production/.terraform"' \
  --prune-empty --tag-name-filter cat -- --all

# Remove .next directories
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch "frontend/.next" "frontend/user/.next"' \
  --prune-empty --tag-name-filter cat -- --all

# Remove artifacts directory
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch "artifacts"' \
  --prune-empty --tag-name-filter cat -- --all

# Remove webpack cache files
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch "*.pack" "*.pack.gz" "*.pack.old"' \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "Cleaning up refs and garbage collection..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "Repository size after cleanup:"
du -sh .git

echo ""
echo "Cleanup complete!"
echo "IMPORTANT: You will need to force push to update the remote repository:"
echo "  git push origin --force --all"
