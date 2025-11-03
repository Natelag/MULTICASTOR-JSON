@echo off
title ▶️ Lancement Backend MultiCastor
setlocal ENABLEEXTENSIONS

cd /d "%~dp0backend"

REM Activation de l'environnement virtuel
call venv\Scripts\activate.bat

echo Démarrage du backend Flask...
python app.py

REM À la fermeture de Flask, désactivation venv (optionnel)
call venv\Scripts\deactivate.bat

pause
