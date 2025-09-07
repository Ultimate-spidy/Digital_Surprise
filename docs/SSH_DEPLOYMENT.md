# SSH Deployment Setup

This document explains how to set up SSH-based deployment for the Digital Surprise application.

## Quick Start

The application now supports SSH-based deployment to GitHub Pages. The required commands are:

```bash
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519
```

## Deployment Methods

### 1. Automated Script Deployment

Use the provided deployment script:

```bash
npm run deploy:ssh
```

This script will:
- Set up the SSH agent
- Add your ed25519 key (or the project's key as fallback)
- Build the application
- Deploy to GitHub Pages

### 2. Manual Deployment

1. Set up SSH agent and add your key:
   ```bash
   eval $(ssh-agent -s)
   ssh-add ~/.ssh/id_ed25519
   ```

2. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```

### 3. GitHub Actions Deployment

The project includes a GitHub Actions workflow that automatically deploys on push to main branch. It uses SSH keys stored in GitHub Secrets.

## SSH Key Setup

### For Local Development

1. Generate an ed25519 SSH key if you don't have one:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -C "your_email@example.com"
   ```

2. Add the public key to your GitHub account's SSH keys

### For GitHub Actions

1. Add your private key to GitHub repository secrets as `SSH_PRIVATE_KEY`
2. Add the public key as a deploy key in your repository settings

## Key Files

- `digital` - Ed25519 private key (project-specific)
- `digital.pub` - Ed25519 public key (project-specific)
- `scripts/deploy.sh` - Automated deployment script
- `.github/workflow/deploy.yml` - GitHub Actions workflow

## Security Notes

- Never commit private keys to the repository
- Use ed25519 keys for better security than RSA
- The project includes sample keys for demonstration - replace with your own for production use