import React from "react";
import { useNavigate } from "react-router-dom";
import "./ConvertDetails.css";

export default function ConvertDetails({ hostCards }) {
  if (!hostCards || hostCards.length === 0) return null;
  const navigate = useNavigate();

  return (
    <div className="convert-page">
      {hostCards.map((equip, idx) => (
        <div className="convert-card" key={idx}>
          <div className="convert-visual">
            <div className="convert-visual-inner">
              <img
                src="/Neuron_CONVERT.png"
                alt="Convert template"
                className="convert-template"
              />
            <div className="convert-content">
              {Object.entries(equip.fields).map(([className, value]) => {
                // Cliquable pour IN1..24, OUT1..24, IO9..32(IN|OUT), jamais pour ...CONV*
                const isClickable = (
                  /^box-(IN([1-8]|[1-9]|1[0-9]|2[0-4])|OUT([1-8]|[9]|1[0-9]|2[0-4]))$/.test(className) ||
                  /^box-IO(9|1[0-9]|2[0-9]|3[0-2])(IN|OUT)$/.test(className)
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
                  <div className={`textbox-convert ${className}-convert`} key={className}>
                    {content}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


