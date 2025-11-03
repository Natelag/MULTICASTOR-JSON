import json
import os

from flask import Blueprint, jsonify, request

import utils

cerebrum_bp = Blueprint("cerebrum", __name__, url_prefix="/cerebrum")

FILES = {
    "diff": os.path.join(utils.HTML_EXPORT_PATH, "RM_DIFF_Export.json"),
    "prod": os.path.join(utils.HTML_EXPORT_PATH, "RM_PROD_Export.json"),
    "pp_diff": os.path.join(utils.HTML_EXPORT_PATH, "RM_DIFF_PP_Export.json"),
    "pp_prod": os.path.join(utils.HTML_EXPORT_PATH, "RM_PROD_PP_Export.json"),
}


def load_json(path):
    if not os.path.exists(path):
        return {"RM_-_Sources": [], "error": "File not found"}
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


# --- Renvoie une variante précise ---
@cerebrum_bp.route("/<variant>", methods=["GET"])
def get_variant(variant):
    file_path = FILES.get(variant.lower())
    if not file_path:
        return jsonify({"RM_-_Sources": [], "error": "Invalid variant"})
    return jsonify(load_json(file_path))


# --- Renvoie tout ---
@cerebrum_bp.route("/all", methods=["GET"])
def get_all():
    merged = []
    for f in FILES.values():
        data = load_json(f)
        merged += data.get("RM_-_Sources", [])
    return jsonify({"RM_-_Sources": merged})
