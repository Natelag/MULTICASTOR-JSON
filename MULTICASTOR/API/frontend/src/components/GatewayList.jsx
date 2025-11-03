import React, { useEffect, useState } from "react";
import GatewayDetails from "./GatewayDetails";
import ConvertDetails from "./ConvertDetails";
import { API_BASE_URL } from "../pages/envConfig";
import "./GatewayList.css";

export default function GatewayList({ variant, title }) {
  const [hostData, setHostData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!variant) return setHostData([]);

    setLoading(true);
    const bridgeUrl = `${API_BASE_URL}/export/Bridge_${variant}_Export.json`;
    const convertUrl = `${API_BASE_URL}/export/Convert_${variant}_Export.json`;

    Promise.all([
      fetch(bridgeUrl).then((r) => (r.ok ? r.json() : [])),
      fetch(convertUrl).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([bridges, converts]) => {
        const withFamily = [
          ...(Array.isArray(bridges) ? bridges.map((h) => ({ ...h, __family: "BRIDGE" })) : []),
          ...(Array.isArray(converts) ? converts.map((h) => ({ ...h, __family: "CONVERT" })) : []),
        ];
        setHostData(withFamily);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading JSON for", variant, err);
        setHostData([]);
        setLoading(false);
      });
  }, [variant]);

  return (
    <main className="main page page-gateway-list">
      {title && (
        <div className="gateway-list-title">
          <h2 className="gateway-title">
            {title} <span className="gateway-count">({hostData.length})</span>
          </h2>
        </div>
      )}

      <div className="gateway-list-container">
        {loading ? (
          <p>🔄 Loading data...</p>
        ) : hostData.length === 0 ? (
          <p style={{ color: "red" }}>❌ No equipments found in JSON</p>
        ) : (
          hostData.map((equip, idx) => (
            equip.__family === "CONVERT" ? (
              <ConvertDetails key={idx} hostCards={[equip]} />
            ) : (
              <GatewayDetails
                key={idx}
                gatewayName={equip.hostname}
                hostCards={[equip]}
              />
            )
          ))
        )}
      </div>
    </main>
  );
}
