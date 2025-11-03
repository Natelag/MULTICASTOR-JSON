import React from "react";
import { useNavigate } from "react-router-dom";
import "./GatewayDetails.css";

export default function GatewayDetails({ hostCards }) {
  if (!hostCards || hostCards.length === 0) return null;
  const navigate = useNavigate();

  return (
    <div className="gateway-page">
      {hostCards.map((equip, idx) => (
        <div className="gateway-card" key={idx}>
          <img
            src="/Neuron_BRIDGE.png"
            alt="Gateway template"
            className="gateway-template"
          />

          {/* Conteneur de textbox */}
          <div className="gateway-content">
            {Object.entries(equip.fields).map(([className, value]) => {
              // Cliquable pour IN/OUT/IO (pas pour ...CONV*). Hostname ouvre Inventory filtré sur hostname.
              const isClickable = (
                /^box-(IN[1-8]|OUT[1-8])$/.test(className) ||
                /^box-IO(9|1[0-9]|2[0-9]|3[0-2])(IN|OUT)$/.test(className) ||
                /^box-IN([1-9]|1[0-9]|2[0-4])$/.test(className)
              ) && !/CONV/.test(className);
              const isHostname = className === 'box-HOSTNAME';
              const content = isHostname ? (
                <button
                  onClick={() => typeof value === 'string' && value.trim() && navigate(`/inventory?hostname=${encodeURIComponent(value.trim())}`)}
                  style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'none', font: 'inherit' }}
                  title={`Filtrer Inventory sur HOSTNAME = ${String(value || '').trim()}`}
                >
                  {value}
                </button>
              ) : isClickable ? (
                <button
                  onClick={() => typeof value === 'string' && value.trim() && navigate(`/inventory?alt2_label=${encodeURIComponent(value.trim())}`)}
                  style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', color: 'inherit', textDecoration: 'none', font: 'inherit' }}
                  title={`Filtrer Inventory sur ALT2 LABEL = ${String(value || '').trim()}`}
                >
                  {value}
                </button>
              ) : (
                value
              );
              return (
                <div className={`textbox ${className}`} key={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
