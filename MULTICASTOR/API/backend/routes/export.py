# routes/export.py
import os
import json
from flask import Blueprint, abort, current_app, send_from_directory, jsonify

export_bp = Blueprint("export", __name__)

# --- Sert les fichiers bruts (inchangé) ---
@export_bp.route("/export/<path:filename>")
def serve_export(filename):
    # Sécurité simple pour éviter les chemins relatifs
    if ".." in filename or filename.startswith("/"):
        abort(400)
    export_path = current_app.config.get("HTML_EXPORT_PATH")
    full_path = os.path.join(export_path, filename)
    if os.path.isfile(full_path):
        return send_from_directory(export_path, filename)
    else:
        abort(404)

# --- Nouvelle route API pour les Bridge JSON ---
@export_bp.route("/export/api/bridge/<variant>", methods=["GET"])
def bridge_export(variant):
    """
    Renvoie le JSON Bridge correspondant au variant demandé.
    Exemple :
      /export/api/bridge/diff -> Bridge_DIFF_Export.json
      /export/api/bridge/prod -> Bridge_PROD_Export.json
    """
    filename = f"Bridge_{variant.upper()}_Export.json"
    export_path = current_app.config.get("HTML_EXPORT_PATH")
    full_path = os.path.join(export_path, filename)

    if not os.path.isfile(full_path):
        return jsonify({"error": f"Bridge export not found: {filename}"}), 404

    with open(full_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    return jsonify(data)

