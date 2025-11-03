@echo off
title ▶️ Lancement Backend MultiCastor (réseau)
setlocal ENABLEEXTENSIONS

cd /d "%~dp0backend"

REM Activation de l'environnement virtuel
call venv\Scripts\activate.bat

REM Définition des variables Flask
set FLASK_APP=app.py
set FLASK_ENV=development

echo ✅ MultiCastor Backend lancé sur http://0.0.0.0:5000
flask run --host=0.0.0.0 --port=5000

REM À la fermeture de Flask, désactivation venv (optionnel)
call venv\Scripts\deactivate.bat

pause