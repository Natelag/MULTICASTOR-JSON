@echo off
setlocal ENABLEEXTENSIONS
title 🛠 Installation complète - MultiCastor

REM Définitions des dossiers (relatifs au dossier du script)
set ROOT=%~dp0
set BACKEND=%ROOT%backend
set FRONTEND=%ROOT%frontend
set INSTALLERS=%ROOT%Installers
set FONTS=%INSTALLERS%\fonts

REM === Détection dynamique du chemin Python pour l'utilisateur courant
set PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe

if not exist "%PYTHON_EXE%" (
    echo ⚠️ Python 3.13.4 non trouvé pour l'utilisateur %USERNAME%.
    echo Installation automatique de Python depuis : %INSTALLERS%\python-3.13.4-amd64.exe
    "%INSTALLERS%\python-3.13.4-amd64.exe" /quiet InstallAllUsers=0 PrependPath=1 Include_test=0
    echo Attente de la fin de l'installation de Python...
    timeout /t 20 /nobreak > nul

    REM Vérification après installation
    if not exist "%PYTHON_EXE%" (
        echo ❌ ERREUR : Impossible d’installer Python automatiquement.
        echo Merci d’installer manuellement depuis : %INSTALLERS%\python-3.13.4-amd64.exe
        pause
        exit /b 1
    )
)

echo =============================================
echo 🔧 Installation complète de MultiCastor
echo =============================================

REM === Étape 0 : Suppression des anciens environnements virtuels (venv) ===
echo.
echo === Suppression des anciens environnements virtuels (venv) ===

if exist "%BACKEND%\venv" (
    echo Suppression de "%BACKEND%\venv"...
    rmdir /s /q "%BACKEND%\venv"
) else (
    echo Aucun venv dans "%BACKEND%" trouvé.
)

REM === Étape 1 : Installation des polices ===
echo.
echo === Installation des polices Raleway ===
for %%f in ("%FONTS%\*.ttf") do (
    echo Copie de %%~nxf dans %WINDIR%\Fonts
    copy "%%f" "%WINDIR%\Fonts" > nul
)
echo Polices installées.

REM === Étape 2 : Vérification Python ===
echo.
echo === Vérification de Python ===
echo Python détecté à : %PYTHON_EXE%

REM === Étape 3 : Vérification Node.js ===
echo.
echo === Vérification de Node.js ===
where npm > nul 2>&1
if errorlevel 1 (
    echo Node.js non trouvé, lancement de l'installation...
    msiexec /i "%INSTALLERS%\node-v22.16.0-x64.msi" /quiet /norestart
    echo Installation de Node.js terminée.
) else (
    echo Node.js détecté.
)

REM === Étape 4 : Backend Python ===
echo.
echo === Configuration backend Python ===
cd /d "%BACKEND%"

echo Création de l'environnement virtuel...
"%PYTHON_EXE%" -m venv venv
if errorlevel 1 (
    echo ❌ ERREUR : Impossible de créer le venv. Peut-être un fichier verrouillé ou un accès refusé.
    echo Ferme tous les processus Python, redémarre ton PC, et réessaie en mode administrateur.
    pause
    exit /b 1
)

echo Activation de l'environnement virtuel...
call venv\Scripts\activate.bat

echo Mise à jour de pip...
"%PYTHON_EXE%" -m pip install --upgrade pip

if not exist "requirements.txt" (
    echo ❌ ERREUR : requirements.txt manquant dans %BACKEND%
    pause
    exit /b 1
)

echo Installation des dépendances Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ ERREUR : Échec de l'installation des dépendances. Problème probable de droits ou de PATH.
    pause
    exit /b 1
)

call venv\Scripts\deactivate.bat
cd /d "%ROOT%"

REM === Étape 5 : Frontend React ===
echo.
echo === Configuration frontend React ===
cd /d "%FRONTEND%"
npm install
cd /d "%ROOT%"

echo.
echo =============================================
echo ✅ Installation complète terminée !
echo ---------------------------------------------
echo ▶️ Pour lancer le backend : executez "1_lancement_backend.bat"
echo ▶️ Pour lancer le frontend : executez "2_lancement_frontend.bat"
echo.
pause
exit
