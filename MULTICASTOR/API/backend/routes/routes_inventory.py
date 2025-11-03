import json
import os

import numpy as np
import pandas as pd
from flask import Blueprint, jsonify

import utils

inventory_bp = Blueprint("inventory", __name__)


def normalize_columns(df, breakout_columns=None):
    """
    Normalise les noms de colonnes et nettoie les valeurs.
    breakout_columns : liste de colonnes à filtrer si valeur 'BREAKOUT'
    """
    # Nettoyage général des colonnes
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.replace(r"[\n\r]+", " ", regex=True)
        .str.replace(r"\s+", "_", regex=True)
        .str.replace(r"[\u25b2\u25bc]+", "", regex=True)
        .str.lower()
    )

    # Renommages spécifiques
    rename_map = {
        "device_/_hostname": "hostname",
        "porttype": "port_type",
        "ref_sfp": "ref_sfp",
        "num_stream/type": "num_stream_type",
        "nb_canaux/type": "nb_canaux_type",
        "endpoint_label": "endpoint_label",
    }
    df = df.rename(columns=rename_map)

    # Filtrage des BREAKOUT
    if breakout_columns:
        for col in breakout_columns:
            if col in df.columns:
                df = df[~df[col].str.upper().eq("BREAKOUT")]

    # Filtrage des lignes PTP
    if "fonction" in df.columns:
        df = df[df["fonction"].str.upper() != "PTP"]

    print("✅ Colonnes après normalisation :", df.columns.tolist())
    return df


def split_ip_port(val):
    """
    Fonction utilitaire pour séparer IP et PORT si elles sont jointes.
    Si val est une string "IP:PORT", retourne [IP, PORT], sinon [val, None]
    """
    if isinstance(val, str) and ":" in val:
        parts = val.split(":")
        return [parts[0].strip(), parts[1].strip()]
    return [val, None]


@inventory_bp.route("/inventory-merged", methods=["GET"])
def inventory_merged():
    try:
        dir_path = utils.HTML_EXPORT_PATH

        # fichiers Database
        file_ref = os.path.join(dir_path, "Database_Multicast_2110_Export.json")
        file_multi = os.path.join(dir_path, "Database_Unicast_2110_Export.json")

        # fichiers RM (différents)
        rm_files = [
            os.path.join(dir_path, "RM_DIFF_Export.json"),
            os.path.join(dir_path, "RM_PROD_Export.json"),
            os.path.join(dir_path, "RM_DIFF_PP_Export.json"),
            os.path.join(dir_path, "RM_PROD_PP_Export.json"),
        ]

        # Vérification fichiers Database
        for f in [file_ref, file_multi] + rm_files:
            if not os.path.isfile(f):
                return jsonify({"error": f"Fichier introuvable : {f}"}), 404

        # Lecture JSON et normalisation
        df_ref = normalize_columns(
            pd.read_json(file_ref, encoding="utf-8-sig"), breakout_columns=["hostname"]
        )
        df_multi = normalize_columns(
            pd.read_json(file_multi, encoding="utf-8-sig"),
            breakout_columns=["hostname", "unicast_r", "unicast_b"],
        )

        # Merge Database
        merged = pd.merge(
            df_multi, df_ref, on="hostname", how="outer", suffixes=("_x", "_y")
        )

        if "endpoint_label" not in merged.columns:
            merged["endpoint_label"] = None

        # Combiner alt1 → alt4 du merge Database
        for i in range(1, 5):
            col_x = f"alt{i}_mnemonic_x"
            col_y = f"alt{i}_mnemonic_y"
            series_x = merged.get(col_x, pd.Series([None] * len(merged)))
            series_y = merged.get(col_y, pd.Series([None] * len(merged)))
            merged[f"alt{i}_mnemonic"] = series_x.combine_first(series_y)
            # Supprimer colonnes intermédiaires
            for col in [col_x, col_y, f"alt.{i}_mnemonic"]:
                if col in merged.columns:
                    merged.drop(columns=[col], inplace=True)

        # Merge RM files
        rm_dfs = []
        for rm_file in rm_files:
            with open(rm_file, encoding="utf-8-sig") as f:
                rm_json = json.load(f)
            records = rm_json.get("RM_-_Sources", []) + rm_json.get(
                "RM_-_Destinations", []
            )
            if records:
                df = pd.DataFrame(records)
                df.columns = [c.lower().strip().replace(" ", "_") for c in df.columns]
                if "id" in df.columns:
                    df.rename(columns={"id": "rm_id"}, inplace=True)
                if "virtual" in df.columns:
                    df.rename(columns={"virtual": "rm_virtual"}, inplace=True)
                for c in ["id_video", "id_audio", "id_data"]:
                    if c in df.columns:
                        tmp = df[df[c].notna()].copy()
                        tmp = tmp.rename(columns={c: "endpoint_label"})
                        rm_dfs.append(tmp)

        if rm_dfs:
            rm_all = pd.concat(rm_dfs, ignore_index=True)
            merged = pd.merge(
                merged, rm_all, on="endpoint_label", how="left", suffixes=("", "_rm")
            )
            # Combiner alt?_mnemonic RM après merge
            for i in range(1, 5):
                col_main = f"alt{i}_mnemonic"
                col_rm = f"alt{i}_mnemonic_rm"
                if col_rm in merged.columns:
                    merged[col_main] = merged[col_main].combine_first(merged[col_rm])
                    merged.drop(columns=[col_rm], inplace=True)

        # Supprimer colonnes inutiles après merge
        for col in [
            "id_video",
            "id_audio",
            "id_data",
            "nb_canaux_type",
            "num_stream_type",
            "port_type",
        ]:
            if col in merged.columns:
                merged.drop(columns=[col], inplace=True)

        # Déduplication fabrique/fonction
        for col_base in ["fabrique", "fonction"]:
            col_x = f"{col_base}_x"
            col_y = f"{col_base}_y"
            if col_x in merged.columns and col_y in merged.columns:
                merged[col_base] = merged[col_x].combine_first(merged[col_y])
                merged.drop(columns=[col_x, col_y], inplace=True)
            elif col_x in merged.columns:
                merged.rename(columns={col_x: col_base}, inplace=True)
            elif col_y in merged.columns:
                merged.rename(columns={col_y: col_base}, inplace=True)

        # --- Séparation IP / PORT pour multicast ---
        for col_base in ["multicast_r", "multicast_b"]:
            if col_base in merged.columns:
                ip_list = []
                port_list = []
                for val in merged[col_base]:
                    ip, port = split_ip_port(val)
                    ip_list.append(ip)
                    port_list.append(port)
                merged[col_base] = ip_list
                port_col = f"port_multi_{col_base[-1]}"  # port_multi_r / port_multi_b
                merged[port_col] = port_list

        merged = merged.drop_duplicates().replace({np.nan: None})

        # Renommage altx_mnemonic → altx_label
        merged = merged.rename(
            columns={
                "alt1_mnemonic": "alt1_label",
                "alt2_mnemonic": "alt2_label",
                "alt3_mnemonic": "alt3_label",
                "alt4_mnemonic": "alt4_label",
            }
        )

        # Réorganisation colonnes finales
        desired_order = [
            "hostname",
            "fabrique",
            "fonction",
            "multicast_r",
            "port_multi_r",
            "unicast_r",
            "switch_r",
            "port_r",
            "multicast_b",
            "port_multi_b",
            "unicast_b",
            "switch_b",
            "port_b",
            "stream",
            "flux",
            "type",
            "rm_mnemonic",
            "endpoint_label",
            "alt1_label",
            "alt2_label",
            "alt3_label",
            "alt4_label",
            "categorie_1",
            "categorie_2",
            "categorie_3",
            "rm_id",
            "rm_virtual",
            "ref_sfp",
            "ref_sfp_switch_r",
            "ref_sfp_switch_b",
            "groupe",
            "zone",
        ]
        merged = merged[
            [c for c in desired_order if c in merged.columns]
            + [c for c in merged.columns if c not in desired_order]
        ]

        print("✅ Colonnes finales dans merged :", merged.columns.tolist())
        return jsonify(merged.to_dict(orient="records"))

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
