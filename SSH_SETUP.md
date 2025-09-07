# SSH Key Setup

This project requires SSH keys for certain operations. The SSH keys should NOT be committed to the repository for security reasons.

## Setting up SSH keys locally

1. Generate SSH keys if you don't have them:
   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. Start the SSH agent and add your key:
   ```bash
   eval $(ssh-agent -s)
   ssh-add ~/.ssh/id_ed25519
   ```

3. If you have custom key files (like `digital`), you can add them instead:
   ```bash
   eval $(ssh-agent -s)
   ssh-add /path/to/your/digital
   ```

## Important Security Note

- **Never commit SSH private keys to the repository**
- Keep your SSH keys in `~/.ssh/` directory locally
- Add SSH key patterns to `.gitignore` to prevent accidental commits

## For Development

The SSH keys are used for secure operations. Make sure your keys are properly configured with the necessary services (GitHub, deployment targets, etc.).