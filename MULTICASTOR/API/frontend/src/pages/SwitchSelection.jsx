import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import SwitchDetails from "../components/SwitchDetails";
import "./SwitchSelection.css";
import { API_BASE_URL } from "./envConfig";

export default function SwitchSelection() {
  const [switchOptions, setSwitchOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const extractHostnames = (htmlText, label, url) => {
    const hostnames = new Set();
    const regex = /\bSW(?:PR|DI|PP)[A-Z0-9]+(?:-[A-Za-z0-9]+)*/g;
    let match;
    while ((match = regex.exec(htmlText)) !== null) {
      hostnames.add(match[0]);
    }
    return Array.from(hostnames).map((name) => ({ name, source: label, url }));
  };

  useEffect(() => {
    async function fetchSwitches() {
      setLoading(true);

      const sources = [
        { filename: "Switch_Diffusion_Export.html", label: "[DIFF]" },
        { filename: "Switch_Production_Export.html", label: "[PROD]" },
        { filename: "Switch_PP_Diffusion_Export.html", label: "[PP-DIFF]" },
        { filename: "Switch_PP_Production_Export.html", label: "[PP-PROD]" },
      ];

      const hostnameMap = new Map();

      for (const { filename, label } of sources) {
        const url = `${API_BASE_URL}/export/${filename}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const htmlText = await res.text();
            const entries = extractHostnames(htmlText, label, url);
            entries.forEach(({ name, source, url }) => {
              if (!hostnameMap.has(name)) {
                hostnameMap.set(name, { source, url });
              }
            });
          } else {
            console.warn(`❌ HTTP ${res.status} sur ${url}`);
          }
        } catch (err) {
          console.error(`⚠️ Erreur de fetch sur ${url}`, err);
        }
      }

      const CATEGORY_ORDER = { "[DIFF]": 0, "[PROD]": 1, "[PP-DIFF]": 2, "[PP-PROD]": 3 };
      function extractNumericSuffix(name) {
        const rest = name.slice(5);
        const match = rest.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : Infinity;
      }

      const sorted = Array.from(hostnameMap.entries())
        .map(([name, { source, url }]) => ({
          name,
          source,
          url,
          categoryOrder: CATEGORY_ORDER[source] ?? 99,
          numericPart: extractNumericSuffix(name),
        }))
        .sort((a, b) => {
          if (a.categoryOrder !== b.categoryOrder) return a.categoryOrder - b.categoryOrder;
          return a.numericPart - b.numericPart;
        });

      setSwitchOptions(sorted.map(({ name, source, url }) => ({ name, source, url })));
      setLoading(false);

      const paramSwitch = searchParams.get("selectedSwitch");
      if (paramSwitch && sorted.find((s) => s.name === paramSwitch)) {
        setSelectedItem(paramSwitch);
      }
    }

    fetchSwitches();
  }, [searchParams]);

  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    setSelectedItem(newValue);
    navigate(`/switch-selection?selectedSwitch=${encodeURIComponent(newValue)}`);
  };

  const selectedSwitchObj = switchOptions.find((s) => s.name === selectedItem);

  return (
    <main className="main page page-switch-selection">
      <h2 className="title-switch-selection">
        Choose a Fabric or select a switch directly to view its information
      </h2>

      {/* Deux lignes de boutons */}
      <nav className="button-group">
        <div className="button-row">
          <Link to="/switch/diff" className="button">DIFFUSION</Link>
          <Link to="/switch/prod" className="button">PRODUCTION</Link>
          <Link to="/switch/ptp" className="button">PTP</Link>
        </div>
        <div className="button-row">
          <Link to="/switch/pp-diff" className="button">PP DIFF</Link>
          <Link to="/switch/pp-prod" className="button">PP PROD</Link>
        </div>
      </nav>

      <div className="search-select-container">
        {loading ? (
          <p>🔄 Loading switches...</p>
        ) : switchOptions.length === 0 ? (
          <p style={{ color: "red" }}>❌ Aucun switch détecté (erreur de chargement HTML ?)</p>
        ) : (
          <>
            <select
              id="switch-select"
              value={selectedItem}
              onChange={handleSelectChange}
              className="search-select"
            >
              <option value="">-- Select a switch --</option>
              {switchOptions.map(({ name, source }) => (
                <option key={name} value={name}>
                  {`${source} ${name}`}
                </option>
              ))}
            </select>

            {selectedItem && selectedSwitchObj && (
              <div className="switch-details-container">
                <div className="switch-details-wrapper">
                  <SwitchDetails
                    switchName={selectedSwitchObj.name}
                    htmlUrl={selectedSwitchObj.url}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
