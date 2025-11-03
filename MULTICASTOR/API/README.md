# 🦫 MultiCastor - Installation & Lancement

MultiCastor est une application interne permettant de gérer les adresses multicast pour la norme ST2110. Elle est composée d’un backend Python (Flask) et d’un frontend React (Vite).

---

## 📁 Arborescence du dossier principal

Documents
└── MULTICASTOR
├── API
│ ├── backend
│ ├── frontend
│ ├── Installers
│ │ ├── python-3.13.4-amd64.exe
│ │ ├── node-v22.16.0-x64.msi
│ │ └── fonts (Raleway)
│ ├── 1_lancement backend.bat
│ ├── 2_lancement frontend.bat
│ └── clean_project.bat
├── Excel_Local (fichiers Excel)
├── Shared
│ └── html_exports
└── logs

yaml
Copier
Modifier

---

## 🧩 Prérequis

⚙️ Système : **Windows obligatoire** (utilisation d’Excel via COM `pywin32`)  
📦 Installateurs fournis dans `API\Installers`

### 1. Python 3.13

- 📁 Dossier : `API\Installers\`
- 🧪 Lancez `python-3.13.4-amd64.exe`
- 📌 Cocher **"Add Python to PATH"** à l’installation

### 2. Node.js 22.16

- 📁 Dossier : `API\Installers\`
- 🧪 Lancez `node-v22.16.0-x64.msi`

### 3. Microsoft Excel

- ✅ Nécessaire pour que les macros Excel fonctionnent dans le backend

---

## 📝 Étapes d’installation

> Tous les scripts `.bat` sont déjà fournis dans `API\`

### 📦 Étape 1 : Lancer le backend

Fichier : `1_lancement backend.bat`

```bat
@echo off
cd /d "%~dp0API\backend"
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
set FLASK_APP=app.py
flask run
pause
✅ Il crée un environnement virtuel, installe les dépendances, et lance l’API Flask
🟢 Par défaut sur http://localhost:5000

🌐 Étape 2 : Lancer le frontend
Fichier : 2_lancement frontend.bat

bat
Copier
Modifier
@echo off
cd /d "%~dp0API\frontend"
npm install
npm run dev
pause
✅ Installe les modules Node.js et lance le frontend React avec Vite
🟢 Par défaut sur http://localhost:3000

🎨 Installation des polices (optionnel)
Les polices Raleway utilisées dans le frontend se trouvent ici :
API\Installers\fonts\

Créer un fichier Install_fonts.bat avec :

bat
Copier
Modifier
@echo off
echo Installation des polices Raleway...
for %%f in ("%~dp0API\Installers\fonts\*.ttf") do (
    copy "%%f" "%WINDIR%\Fonts"
)
echo ✅ Polices installées.
pause
🧼 Nettoyage & formatage (optionnel développeur)
Fichier : clean_project.bat
✅ Formate automatiquement le backend Python et frontend React
📄 Un log complet est généré dans le dossier logs\

⚙️ Configuration spécifique
Le fichier config.ini permet d’indiquer le chemin d’accès au fichier Excel principal.

À adapter si l’emplacement du fichier .xlsm change.

🛠 Dépannage
Python non reconnu ? → Relance l’installeur avec "Add to PATH"

Erreur pywin32 ? → Excel doit être installé

Frontend ne se lance pas ? → Vérifie que npm install s’est bien exécuté

Ports 3000/5000 bloqués ? → Modifier les ports dans vite.config.js ou lancer sur une autre machine

📬 Contact
Gaétan Menzago
