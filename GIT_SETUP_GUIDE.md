# Git Configuration Guide for VS Code

## Quick Setup Commands

Open **Git Bash** (not PowerShell) and run these commands:

```bash
# 1. Configure your name
git config --global user.name "Carter Matherne"

# 2. Configure your email (use your GitHub email)
git config --global user.email "your-email@example.com"

# 3. Verify your configuration
git config --global --list

# 4. Optional: Set VS Code as default editor
git config --global core.editor "code --wait"
```

## Step-by-Step Instructions

### Option 1: Using Git Bash (Recommended)

1. **Open Git Bash**
   - Press `Windows Key`
   - Type "Git Bash"
   - Click "Git Bash" to open

2. **Configure Git**
   ```bash
   git config --global user.name "Carter Matherne"
   git config --global user.email "your-github-email@example.com"
   ```

3. **Verify**
   ```bash
   git config --global --list
   ```
   You should see:
   ```
   user.name=Carter Matherne
   user.email=your-github-email@example.com
   ```

### Option 2: Install Git for Windows

If Git Bash doesn't work, you may need to install Git:

1. Download Git from: https://git-scm.com/download/win
2. Run the installer (use all default settings)
3. Restart VS Code
4. Open Git Bash and run the configuration commands above

### Option 3: Using GitHub Desktop (Easiest)

If you prefer a GUI:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. It will automatically configure your name and email
4. You can commit and push through the GUI

## For Your Current Project

Once Git is configured, navigate to your project and commit:

```bash
cd "/c/Users/Carter Matherne/inv101"
git add .
git commit -m "Add MongoDB article cache database with automatic cleanup and replace missing images with emojis"
git push origin main
```

## Find Your GitHub Email

1. Go to https://github.com/settings/emails
2. Use your primary email or the GitHub-provided no-reply email:
   - Format: `username@users.noreply.github.com`
   - Example: `CMath-ProClub@users.noreply.github.com`

## VS Code Git Integration

Once Git is configured, VS Code will automatically:
- Show file changes in the Source Control panel (Ctrl+Shift+G)
- Allow you to commit and push from VS Code
- Display Git status in the status bar

## Troubleshooting

### "git is not recognized"
- Git is not installed or not in your PATH
- Solution: Install Git from https://git-scm.com/download/win

### "Please tell me who you are"
- Git needs your name and email configured
- Solution: Run the `git config` commands above

### "Permission denied"
- You need to authenticate with GitHub
- Solution: Set up SSH keys or use GitHub Desktop

## Quick Test

To test if Git is working:

```bash
git --version
```

Should output something like: `git version 2.x.x`

---

**Note**: Based on your GitHub repo name (CMath-ProClub/inv101), your username appears to be `CMath-ProClub`.

**Recommended email**: `CMath-ProClub@users.noreply.github.com` (this keeps your real email private)
