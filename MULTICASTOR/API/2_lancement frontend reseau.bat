@echo off
title ▶️ Lancement Frontend MultiCastor
setlocal ENABLEEXTENSIONS

cd /d "%~dp0frontend"

echo Démarrage du frontend React...
call npm run dev -- --host

pause
