@echo off
setlocal ENABLEEXTENSIONS

:: Forcer dossier courant sur celui du script
cd /d "%~dp0"

:: Créer dossier logs s’il n’existe pas
if not exist logs (
    mkdir logs
)

:: Définir dossier log et fichier avec timestamp
set "LOG_DIR=logs"
set "NOW=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "NOW=%NOW::=%"
set "NOW=%NOW: =0%"
set "LOG_FILE=%LOG_DIR%\clean_report_%NOW%.log"

:: Debug : afficher le chemin complet du log
echo DEBUG: LOG_FILE=%LOG_FILE%
pause

:: En-tête log
call :log_header > "%LOG_FILE%" 2>&1

:: Appeler fonction principale, rediriger sortie dans log
call :main >> "%LOG_FILE%" 2>&1

echo.
echo 🔍 Un log complet a été généré ici :
echo    %LOG_FILE%

:: Ouvrir automatiquement le log dans Notepad
start notepad "%LOG_FILE%"

:: Popup Windows de confirmation
mshta "javascript:alert('✅ Formatage terminé avec succès !\n\n📝 Log ouvert dans Notepad.');close();"

pause
exit /b

:: === En-tête du log ===
:log_header
echo =============================================
echo 🔧 MultiCastor - Rapport de nettoyage
echo Date : %DATE% - Heure : %TIME%
echo =============================================
echo.
exit /b

:: === Fonction principale ===
:main
title 🔧 MultiCastor - Full Clean & Formatter

echo =============================================
echo 🔍 Vérification des outils nécessaires...
echo =============================================

cd backend

where black > nul 2>&1 || (
    echo → Installation de black...
    pip install black
)

where isort > nul 2>&1 || (
    echo → Installation de isort...
    pip install isort
)

where flake8 > nul 2>&1 || (
    echo → Installation de flake8...
    pip install flake8
)

echo.
echo ✅ Outils Python prêts.

echo =============================================
echo 📁 Formatage BACKEND Python
echo =============================================
echo → Black (formatage)
black .

echo → isort (tri des imports)
isort .

echo → flake8 (analyse de style)
flake8 .

cd ..

where npm > nul 2>&1 || (
    echo ❌ npm n'est pas installé. Installe Node.js : https://nodejs.org/
    exit /b 1
)

cd frontend

echo.
echo =============================================
echo 🔍 Vérification/installation outils FRONTEND...
echo =============================================

call npm list prettier > nul 2>&1 || npm install --save-dev prettier
call npm list eslint > nul 2>&1 || npm install --save-dev eslint
call npm list stylelint > nul 2>&1 || npm install --save-dev stylelint
call npm list stylelint-config-standard > nul 2>&1 || npm install --save-dev stylelint-config-standard
call npm list depcheck > nul 2>&1 || npm install --save-dev depcheck

echo.
echo ✅ Outils frontend prêts.

echo =============================================
echo 🌐 Formatage FRONTEND React
echo =============================================

echo → Prettier (format)
npx prettier --write .

echo → ESLint (corrections automatiques)
npx eslint . --fix

echo → Stylelint (corrections CSS)
npx stylelint "**/*.css" --fix

echo.
echo =============================================
echo 📦 Analyse des dépendances inutiles
echo =============================================
npx depcheck

cd ..

echo.
echo ✅ Nettoyage terminé avec succès !
echo =============================================
exit /b
