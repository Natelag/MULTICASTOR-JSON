import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import GatewayCardEditable from "../components/GatewayCardEditable"; // <- template BRIDGE editable
import ConvertCardEditable from "../components/ConvertCardEditable"; // <- template CONVERT editable
import "./GatewaySelection.css";
import { API_BASE_URL } from "./envConfig";

export default function GatewaySelection() {
  const [gatewayOptions, setGatewayOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedHostData, setSelectedHostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterParam = searchParams.get("filter") || "";

  const extractGateways = (data, label, url) => {
    const hostnames = new Set();
    const walk = (node) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(walk);
        return;
      }
      if (typeof node === "object") {
        if (typeof node.hostname === "string" && node.hostname.trim().length > 0) {
          hostnames.add(node.hostname.trim());
        }
        Object.values(node).forEach(walk);
      }
    };
    walk(data);
    return Array.from(hostnames).map((name) => ({ name, source: label, url }));
  };

  useEffect(() => {
    async function fetchGateways() {
      setLoading(true);

      const sources = [
        // BRIDGE
        { filename: "Bridge_DIFF_Export.json", label: "[DIFF]", family: "BRIDGE" },
        { filename: "Bridge_PP_DIFF_Export.json", label: "[PP-DIFF]", family: "BRIDGE" },
        { filename: "Bridge_PROD_Export.json", label: "[PROD]", family: "BRIDGE" },
        { filename: "Bridge_PP_PROD_Export.json", label: "[PP-PROD]", family: "BRIDGE" },
        // CONVERT
        { filename: "Convert_DIFF_Export.json", label: "[DIFF]", family: "CONVERT" },
        { filename: "Convert_PP_DIFF_Export.json", label: "[PP-DIFF]", family: "CONVERT" },
        { filename: "Convert_PROD_Export.json", label: "[PROD]", family: "CONVERT" },
        { filename: "Convert_PP_PROD_Export.json", label: "[PP-PROD]", family: "CONVERT" },
      ];

      const gatewayMap = new Map();

      for (const { filename, label, family } of sources) {
        const url = `${API_BASE_URL}/export/${filename}`;
        try {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const entries = extractGateways(data, label, url);
            entries.forEach(({ name, source, url }) => {
              if (!gatewayMap.has(name)) gatewayMap.set(name, { source, url, family });
            });
          }
        } catch (err) {
          console.error(`Fetch error on ${filename}:`, err);
        }
      }

      const CATEGORY_ORDER = { "[DIFF]": 0, "[PROD]": 1, "[PP-DIFF]": 2, "[PP-PROD]": 3 };
      const sorted = Array.from(gatewayMap.entries())
        .map(([name, { source, url, family }]) => ({
          name,
          source,
          url,
          family,
          categoryOrder: CATEGORY_ORDER[source] ?? 99,
          numericPart: parseInt(name.slice(2)) || Infinity,
        }))
        .sort((a, b) => a.categoryOrder - b.categoryOrder || a.numericPart - b.numericPart);

      const options = sorted.map(({ name, source, url, family }) => ({ name, source, url, family }));
      setGatewayOptions(options);
      setFilteredOptions(
        filterParam
          ? options.filter((g) => g.source.toLowerCase().includes(filterParam))
          : options
      );

      setLoading(false);

      const paramGateway = searchParams.get("selectedGateway");
      if (paramGateway && options.find((g) => g.name === paramGateway)) {
        setSelectedItem(paramGateway);
      }
    }

    fetchGateways();
  }, [searchParams, filterParam]);

  useEffect(() => {
    if (!selectedItem) {
      setSelectedHostData(null);
      return;
    }

    const selectedGatewayObj = gatewayOptions.find((g) => g.name === selectedItem);
    if (!selectedGatewayObj) return;

    setLoadingDetails(true);
    fetch(selectedGatewayObj.url)
      .then((res) => res.json())
      .then((data) => {
        const hostCards = data.filter(
          (h) => h.hostname === selectedItem || h.hostname?.includes(selectedItem)
        ).map((h) => ({ ...h, __family: selectedGatewayObj.family }));
        setSelectedHostData(hostCards.length > 0 ? hostCards : null);
      })
      .catch((err) => {
        console.error("Error fetching host details:", err);
        setSelectedHostData(null);
      })
      .finally(() => setLoadingDetails(false));
  }, [selectedItem, gatewayOptions]);

  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    setSelectedItem(newValue);
    navigate(
      `/gateway-selection?selectedGateway=${encodeURIComponent(
        newValue
      )}${filterParam ? `&filter=${filterParam}` : ""}`
    );
  };

return (
    <main className="page-gateway-selection">
      <h2 className="title-gateway-selection">
        Choose a Gateway or select one directly to view its information
      </h2>

      <nav className="gateway-button-group">
        <Link to="/gateway/diff" className="button">DIFFUSION</Link>
        <Link to="/gateway/prod" className="button">PRODUCTION</Link>
        <Link to="/gateway/pp-diff" className="button">PP DIFF</Link>
        <Link to="/gateway/pp-prod" className="button">PP PROD</Link>
      </nav>

      <div className="gateway-search-select-container">
        {loading ? (
          <p>🔄 Loading gateways...</p>
        ) : filteredOptions.length === 0 ? (
          <p>❌ No gateways found (JSON load error?)</p>
        ) : (
          <>
            <select
              id="gateway-select"
              value={selectedItem}
              onChange={handleSelectChange}
              className="gateway-search-select"
            >
              <option value="">-- Select a gateway --</option>
              {filteredOptions.map(({ name, source }) => (
                <option key={name} value={name}>
                  {`${source} ${name}`}
                </option>
              ))}
            </select>

            {selectedHostData && (
              <div className="gateway-details-fixed-container">
                {selectedHostData.map((host, idx) => (
                  host.__family === "CONVERT" ? (
                    <ConvertCardEditable key={idx} hostCards={[host]} />
                  ) : (
                    <GatewayCardEditable key={idx} hostCards={[host]} />
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} // <-- attention à bien fermer la fonction ici