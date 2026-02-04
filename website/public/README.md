# Place your EvidEx installer here

To make the download button work:

1. Build your desktop app for production:
   ```bash
   cd ..  # Go to main app directory
   npm run build  # or your build command
   ```

2. Copy the generated `.exe` file to this directory
3. Rename it to `EvidEx-Setup.exe`

The download button will automatically serve this file.
