import configparser
import os
from flask import Flask, abort, request, send_from_directory
from flask_cors import CORS
import utils

# --- Path vers le build frontend ---
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))

# --- Flask app ---
app = Flask(__name__, static_folder=FRONTEND_DIST, static_url_path="")
CORS(app)

# --- Charger config sans interpolation ---
config = configparser.ConfigParser(interpolation=None)
config.read("config.ini")

# Expansion des variables d'environnement
utils.HTML_EXPORT_PATH = os.path.expandvars(config.get("DEFAULT", "HtmlExportPath"))
app.config["HTML_EXPORT_PATH"] = utils.HTML_EXPORT_PATH

# --- Import des routes existantes ---
from routes import register_routes
register_routes(app)

# --- Route pour servir les fichiers HTML exportés via /export/filename ---
@app.route("/export/<path:filename>")
def serve_export(filename):
    full_path = os.path.join(utils.HTML_EXPORT_PATH, filename)
    if os.path.isfile(full_path):
        return send_from_directory(utils.HTML_EXPORT_PATH, filename)
    return f"File not found: {filename}", 404

# --- Route pour servir les assets Vite ---
@app.route("/assets/<path:filename>")
def serve_assets(filename):
    return send_from_directory(os.path.join(FRONTEND_DIST, "assets"), filename)

# --- Catch-all pour React SPA (doit être en dernier) ---
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # Ignorer les routes API ou export
    if path.startswith(("api", "export", "health", "inventory-merged", "cerebrum", "html")):
        return "Not Found", 404

    # Servir un fichier statique si existant
    requested_file = os.path.join(FRONTEND_DIST, path)
    if os.path.isfile(requested_file):
        return send_from_directory(FRONTEND_DIST, path)

    # Sinon fallback sur index.html pour React Router
    return send_from_directory(FRONTEND_DIST, "index.html")

# --- DEBUG: affichage routes et statuts ---
def log_routes():
    print("\n🔍 ROUTES ENREGISTRÉES:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.rule} -> {rule.endpoint} [{', '.join(rule.methods)}]")
    print(f"\n📁 STATIC FOLDER: {app.static_folder}")
    print(f"📁 STATIC FOLDER EXISTS: {os.path.exists(app.static_folder)}")
    if os.path.exists(app.static_folder):
        index_file = os.path.join(app.static_folder, "index.html")
        print(f"📄 INDEX.HTML PATH: {os.path.abspath(index_file)}")
        print(f"📄 INDEX.HTML EXISTS: {os.path.exists(index_file)}")
        print(f"📂 DIST CONTENTS: {os.listdir(app.static_folder)}")
    print("")

# --- Run ---
if __name__ == "__main__":
    log_routes()
    print("MultiCastor Backend started on http://0.0.0.0:5000")
    app.run(debug=True, host="0.0.0.0", port=5000, threaded=False)
