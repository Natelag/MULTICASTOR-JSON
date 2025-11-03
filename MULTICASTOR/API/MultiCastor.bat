@echo off
title ▶️ Lancement Backend + Frontend MultiCastor
setlocal ENABLEEXTENSIONS

:: --- BACKEND ---
cd /d "%~dp0backend"

REM Activation de l'environnement virtuel
call venv\Scripts\activate.bat

REM Définition des variables Flask
set FLASK_APP=app.py
set FLASK_ENV=development

echo ✅ MultiCastor Backend lancé sur http://0.0.0.0:5000
start cmd /k flask run --host=0.0.0.0 --port=5000

REM Attente 5 secondes avant de lancer le frontend
timeout /t 5 /nobreak >nul

:: --- FRONTEND ---
cd /d "%~dp0frontend"

echo 🚀 Démarrage du frontend React...
start cmd /k npm run dev -- --host

echo.
echo ✅ Backend et Frontend sont lancés !

