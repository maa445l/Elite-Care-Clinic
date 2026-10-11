Elite Care Clinic for Windows
==============================
1. Get the installer. Easiest and gives update notices: upload this folder to a free public GitHub repository and let it build the installer (see the guide, Part 1, Option A).
   Or build it yourself: right-click BUILD-INSTALLER.bat and choose Run as administrator.
2. Install the file made in the "dist" folder on the server computer, then on the others.
3. Read SETUP_GUIDE_WINDOWS.pdf for every step.

Without the installer (backup plan): double-click START-SERVER-NO-INSTALL.bat on the server computer
(needs Node.js from https://nodejs.org) and open http://localhost:3737 .

Forgot the owner password? In the installed app: File, Forgot the owner password.
Without the installer: node server\reset-owner.js "NewPassword123"  (stop the server first).
