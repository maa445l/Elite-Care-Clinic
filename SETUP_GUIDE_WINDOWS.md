
# Elite Care Clinic for Windows: build, install and run

This is the offline version of your clinic software. Nothing runs on the internet. One computer, the server, keeps all the data in a single file. Your other clinic computers connect to it over the clinic network. Every staff member has their own username and password and their own permissions. The data file is backed up automatically every day.


## How it fits together

- Server computer: one PC that stays switched on. It holds the data file and makes the daily backups.
- Other computers: connect to the server using a browser (Chrome or Edge), or by installing the same Setup.exe and choosing Client.
- Everything stays inside your clinic network. Nothing is sent to the internet.
- The installer is built once on a PC with internet. After that, all clinic computers work with no internet at all.

## What changed from the Claude and cloud versions

- Same screens: patients, prescriptions, vitals, lab grid, Urdu instructions, signature, printing, PDF, templates, co-morbidities.
- Staff accounts are created inside the app (Admin tab). There is no Claude or Supabase login.
- The AI features (Check grammar and the drug interaction and safety check) are not in the offline version, because they need the internet and an AI service. Word suggestions while typing still work, and the built-in Urdu translator still works. Rare Urdu phrases that are not in the built-in list print in English.

## Cost

- Software: Rs 0. The installer is not signed with a paid certificate, so Windows will show a warning once per computer (explained below).
- Hardware and running cost: see the local server plan (about Rs 35,000 to 70,000 once, then about Rs 600 to 1,000 a month for electricity).

# Part 1: Get the installer

There are two ways. Option A is easier and also gives you automatic update notices later, because GitHub builds the installer for you online. Option B builds it on your own PC.


## Option A (recommended): let GitHub build it, free

1. Go to github.com and create a free account.
2. Press New repository. Name it elite-care-clinic. Choose Public. Do not tick any extra boxes. Press Create repository. Public means anyone could see the software code and download the installer. It contains NO patient data and no passwords. Patient data stays on your clinic server.
3. On the new repository page press uploading an existing file. Unzip the package first, open the elite-care-clinic-windows folder, select everything inside it and drag it into the GitHub page. Wait for the upload, then press Commit changes.
4. Check that a folder named .github appeared. If it did not (some browsers skip hidden folders), press Add file > Create new file, type .github/workflows/build-release.yml as the name, paste the contents of that file from the package, and press Commit changes.
5. Open the Actions tab. If it asks, press I understand my workflows, go ahead and enable them. A run called Build and publish the Windows installer starts by itself. It takes about 8 to 15 minutes. A green tick means it worked. A red cross means it failed: open it, copy the last lines of the log and send them to me.
6. When it is green, open Releases (on the right of the repository page), open the newest release and download the file ending in .exe. That is your installer. Copy it to a USB stick.

> If the Actions run fails at the last step (Publish the release) but the Build step before it is green, you can still get the installer: open that run, scroll to Artifacts at the bottom, download installer, unzip it, and use the .exe inside. Update notices will not work until the publish step is fixed. Send me the red lines of that step and I will fix it.

Each upload that changes files makes a new numbered release (1.0.1, 1.0.2 and so on) automatically.


## Option B: build it on your own PC

1. Install Node.js. Go to nodejs.org, download the LTS version, run it with the default options, then restart the computer.
2. Copy the elite-care-clinic-windows folder to a simple place such as C:\ClinicBuild. Do not put it inside Program Files.
3. Right-click BUILD-INSTALLER.bat and choose Run as administrator. It downloads tools (about 300 MB) and builds. Allow 5 to 15 minutes.
4. When it says Done, the installer is in the dist folder, named Elite Care Clinic Setup 1.0.0.exe. Copy it to a USB stick.

> Installers made by Option B do not get update notices, because they are not tied to your GitHub releases. Use Option A if you want updates.


> I could not test the GitHub build, the Option B build or the update feature, because I do not have Windows or the internet here. If anything fails, send me the last 20 lines of the log and I will fix it with you.


| Message in the black window (Option B) | What to do |
|---|---|
| Node.js is not installed | Install Node.js LTS from nodejs.org, restart the computer, run the file again. |
| Cannot create symbolic link | Right-click BUILD-INSTALLER.bat and choose Run as administrator. Or turn on Developer Mode in Windows Settings > For developers. |
| npm install failed or network errors | Check the internet. Try again, or try a different network such as mobile data. Antivirus may block downloads: pause it for the build. |
| Anything else | Send me the last 20 lines of the window. |


## Backup plan if the installer will not build

On the server computer only, install Node.js, then double-click START-SERVER-NO-INSTALL.bat in the same folder. It runs the same server and opens the app in your browser. Keep that black window open while the clinic is working. Other computers use the address it prints. You lose only the tray icon, the menu and update notices.


# Part 2: Install on the server computer

1. Run Elite Care Clinic Setup 1.0.0.exe. Windows may say Windows protected your PC. This happens because the installer is not signed. Press More info, then Run anyway. Choose the install folder and finish.
2. Open Elite Care Clinic. The first time it asks what this computer should do. Choose This computer is the clinic server. For the backup folder choose a folder on the external hard drive. If the drive is not plugged in yet, leave it empty and change it later under File > Choose backup folder. Leave Start automatically when Windows starts ticked.
3. Windows Firewall will ask whether to allow Elite Care Clinic. Tick Private networks and press Allow access. If you press Cancel, other computers cannot connect. You can fix it later in Windows Security > Firewall > Allow an app.
4. The app opens on First time setup. Type your full name, a username (for example drahmad), and a password of 8 or more characters. Press Create owner account. Write the username and password down and keep them safe.
5. Find the server address: File > Show connection address. It looks like http://192.168.1.50:3737. Write it down.
6. Reserve that address for the server in your router (DHCP reservation, see the local server plan) so it never changes.
7. Make sure the computer never sleeps, restarts by itself after a power cut, and is on the UPS (see the local server plan).
When you close the window the app keeps running in the background. Its icon stays near the clock. Right-click it and choose Quit to stop the server. Quitting makes one more backup.


# Part 3: Connect the other computers


## Easiest: use the browser

1. On each computer open Chrome or Edge and type the server address, for example http://192.168.1.50:3737.
2. Bookmark it, or create a desktop shortcut: Chrome menu > Cast, save and share > Create shortcut (tick Open as window).

## Or install the same Setup.exe

1. Install Elite Care Clinic Setup 1.0.0.exe on that computer. When it asks, choose This computer connects to the clinic server and type the server address (the numbers only are fine, for example 192.168.1.50).
Client computers store no patient data. Everything is on the server. If the server is switched off, the other computers show a message saying they cannot reach it.


# Part 4: Move your existing data

1. Open the Claude version of the app. Go to My details, scroll to Backup and press Download full backup. Save the file.
2. In the new app sign in as the owner. Open Admin > Patients file > Import a patients file and choose that file. Confirm.
3. Check a few patients, prescriptions and lab results. Do this once only: importing twice makes duplicates.
Your signature, doctor details and medicine templates come across with the import. Check My details after importing.


# Part 5: Staff accounts and permissions

1. Sign in as the owner and open Admin.
2. In Add a staff member type the person's name, a username (letters and numbers, no spaces) and a password of 8 or more characters. Press Create account.
3. In the list below, pick a Quick preset (Doctor, Assistant, Receptionist, Read only) or tick permissions one by one, then press Save changes.
4. Give each person their own username and password. Never share one login.

| Permission | What it allows |
|---|---|
| See the patient list | Open Patients and see names |
| Add and edit patients | Create patients, edit details and co-morbidities |
| Delete patients | Remove a patient and all their records |
| See prescriptions | View and print past prescriptions |
| Write and edit prescriptions | Create, edit and reuse prescriptions |
| Delete prescriptions | Remove a saved prescription |
| See / Add and edit lab reports | View, or also change, the lab grid |
| Edit medicine templates and lists | Medicines tab, lab test list and timing buttons |
| Edit doctor and clinic details | My details tab (letterhead) |

- New staff can do nothing until you tick permissions. The owner always has full access.
- Reset password sets a new password for a person who forgot theirs. Delete account removes a person. Unticking Account active blocks sign in without deleting.
- Anyone can change their own password with the Change password button at the top.
- After 5 wrong passwords an account is locked for 5 minutes. People are signed out after 30 minutes of no activity.
- The Recent activity list in Admin shows who added, changed or deleted what.

## If the owner forgets the password

On the server computer open the app and choose File > Forgot the owner password. Type a new password. This needs physical access to the server computer, so keep that computer in a room that can be locked.


# Part 6: Backups (do not skip this)

- A backup file is saved automatically every day to the backup folder, and the newest 60 are kept. Quitting the app makes one more.
- Admin > Server and backups shows the data file location, the backup folder and the latest backups. Backup now makes an extra one at any time.
- Download database file saves a full copy that you can keep anywhere. Restore a database file puts a copy back (it replaces everything and signs everyone out; a safety backup is made first).
- Follow the 3-2-1 rule: the live data on the server, the daily copy on the external drive, and a weekly copy on a second drive or USB that goes home with you.
- Test a restore once a month on a spare day. A backup you have never restored is not yet a backup.
- Backup files contain staff password fingerprints and all patient records. Keep them private. Turning on BitLocker for the server computer (Windows Pro) is a good extra protection.
- Where the data lives when installed: C:\Users\(your user)\AppData\Roaming\Elite Care Clinic\data\clinic-data.json. File > Open data folder takes you there.

# Printing, PDF and Urdu

- Print opens the normal Windows print window. Download PDF saves a one-page A4 file you can send to a patient.
- Urdu text uses a font on the computer. Windows has Urdu Typesetting. For the nicest Nastaliq look, install the free Noto Nastaliq Urdu font on every computer: download it once from fonts.google.com, then right-click the file and choose Install.

# Updating the software later (it always asks first)

This works for computers that installed the app from a GitHub release (Option A). The server computer needs internet at least sometimes.

1. When I give you new files, upload them to your GitHub repository (Add file > Upload files, drag the changed files in, choose to replace the old ones, Commit changes). Wait for the green tick under Actions.
2. On each clinic computer that has the app installed, a message appears within about 6 hours the next time the computer is online: A new version of Elite Care Clinic is available. You can also open File > Check for updates at any time.
3. Press Update now to download it. Nothing is installed yet.
4. When it says the version is ready, press Restart and install when the clinic is quiet. A backup is made first. If this is the server computer, the other computers lose connection for about a minute. Choose Later if you are busy.
- Other computers that only use the browser need nothing: they get the new screens from the server as soon as the server is updated.
- Your patient data, staff accounts and backups are never touched by an update.
- Update the server computer first, then any computers that have the app installed in client mode.
- I cannot push updates myself. Nothing changes on your computers until you upload new files and press Update now.

# Keeping data in step with the Claude app

There is no automatic link between the Claude app and the offline app. The Claude app keeps its data inside Claude, which the offline server cannot reach, and the offline server is on your private network, which the Claude app cannot reach. So data does not flow by itself in either direction.

The simplest and safest way is to pick one place to enter patients: the offline app. If you still use the Claude app sometimes, for example from your phone, you can bring its new entries across by file:

1. In the Claude app open My details, scroll to Backup and press Download full backup.
2. In the offline app, signed in as the owner, open Admin > Patients file > Import a patients file and choose that file. Confirm.
- It adds only patients, prescriptions and lab results that are new. Anything already brought across before is skipped, so you can repeat it as often as you like with no duplicates.
- It never overwrites or deletes anything. If you changed an existing patient's details, or edited an old prescription, in the Claude app, those edits are not copied.
- Nothing is copied back from the offline app to the Claude app.
- Records you imported before this update had no source marker, so importing the same Claude file again would duplicate those. The first time, import once into an empty system, or ask me to help clean it up.

# Security checklist

- The clinic network uses http, not https, so passwords are not encrypted between computers. This is acceptable on a private network with a strong Wi-Fi password (WPA2 or WPA3). Keep patients on a separate guest Wi-Fi.
- Never forward a port on the router to the server. It must not be reachable from the internet.
- Keep Windows updates and Windows Security on. Do not install games or unknown software on the server.
- Block a staff member's account the day they leave.
- Check what privacy and medical record rules apply where you practise.

# Troubleshooting


| What you see | What to do |
|---|---|
| Cannot reach the clinic server | The server computer is off or asleep, the address is wrong, or the firewall blocked it. Check the address in File > Show connection address on the server, and allow the app on Private networks in the firewall. |
| The clinic server could not start | Another copy may already be running. Look for the icon near the clock and quit it. Or restart the computer. |
| The data file is damaged | The app will not start empty on purpose. Restore a backup file from the backup folder: choose Restore a database file in Admin, or ask me how to do it from the folder. |
| Wrong username or password | Owner: use Reset password for staff in Admin. For the owner use File > Forgot the owner password on the server. |
| Other computers are slow | Use a LAN cable for the server and for desktop computers. Check the Wi-Fi. |
| A person cannot see something | They need the right permission in Admin. Prescriptions and labs have their own permissions. |
| Windows protected your PC | This is the unsigned installer warning. Press More info, then Run anyway. |


# What I tested and what I could not

- Tested here: the server and the app screens in a simulated browser. This included first setup, login, staff accounts and permissions, patients, prescriptions, the lab grid, Urdu, PDF, backups, restore, owner password reset, a wrong-password lockout, saving after a restart, and use from a network address like http://192.168.x.x.
- Not tested: the GitHub build, building the installer, update notices, the Electron window and tray icon, Windows Firewall, the Windows installer, and printing on a real printer. I could not run Windows or reach the internet here. That is why Part 1 asks you to send me any error. The repeatable import was tested here.
- A single server computer is a single point of failure. The backup plan is what protects you.
- Other computers see changes after a short delay, about 45 seconds, not instantly. If two people edit the same record at once, the last save wins.