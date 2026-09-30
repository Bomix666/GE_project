@echo off
rem GLOBAL EFFECTS - dev server. Double-click to run; close the window to stop.
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
start "" http://127.0.0.1:5173/
call npm run dev
