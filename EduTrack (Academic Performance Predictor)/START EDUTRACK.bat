@echo off
title EduTrack - Academic Performance Classifier
echo.
echo  Starting EduTrack...
echo  Please wait...
echo.
cd /d "C:\Users\Sahanashree\Desktop\Academic Performance Project"
start python app.py
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:5000"
echo.
echo  EduTrack is running!
echo  Close this window to stop the server.
pause