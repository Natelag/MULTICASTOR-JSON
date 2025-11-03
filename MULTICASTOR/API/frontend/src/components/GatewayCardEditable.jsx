import React from "react";
import { useNavigate } from "react-router-dom";
import "./GatewayCardEditable.css";

export default function GatewayCardEditable({ hostCards }) {
  if (!hostCards || hostCards.length === 0) return null;
  const navigate = useNavigate();

  return (
    <div className="editable-page">
      {hostCards.map((equip, idx) => (
        <div className="gateway-card-editable" key={idx}>
          {/* Image de fond de la carte */}
          <img
            src="/Neuron_BRIDGE.png"
            alt="Gateway template"
            className="gateway-template-editable"
          />

          {/* Calque des textbox positionnées en absolu */}
          <div className="gateway-content-editable">
            {Object.entries(equip.fields).map(([fieldKey, value]) => {
              // Normaliser la classe: on s'attend à des clés style "box-..."
              const baseClass = fieldKey.startsWith("box-") ? fieldKey : `box-${fieldKey}`;

              // Clic autorisé UNIQUEMENT pour IN1..8, OUT1..8, IO9..32(IN|OUT), IN1..24 et jamais pour ...CONV/CONVIN/CONVOUT
              const isClickable = (
                /^box-(IN[1-8]|OUT[1-8])\b/.test(baseClass) ||
                /^box-IO(9|1[0-9]|2[0-9]|3[0-2])(IN|OUT)/.test(baseClass) ||
                /^box-IN([1-9]|1[0-9]|2[0-4])\b/.test(baseClass)
              ) && !/CONV/.test(baseClass);

              // Hostname: clic pour filtrer Inventory par hostname
              const isHostname = baseClass === 'box-HOSTNAME';

              if (isHostname) {
                return (
                  <button
                    key={fieldKey}
                    className={`textbox-editable is-clickable ${baseClass}-editable`}
                    title={`${baseClass}-editable`}
                    onClick={() => typeof value === 'string' && value.trim() && navigate(`/inventory?hostname=${encodeURIComponent(value.trim())}`)}
                    style={{ background: 'none', border: '1px solid transparent', padding: 0, margin: 0, cursor: 'pointer', textDecoration: 'none' }}
                  >
                    {value}
                  </button>
                );
              }

              if (isClickable) {
                // Zones cliquables: filtrage Inventory sur alt2_label
                return (
                  <button
                    key={fieldKey}
                    className={`textbox-editable is-clickable ${baseClass}-editable`}
                    title={`${baseClass}-editable`}
                    onClick={() => typeof value === 'string' && value.trim() && navigate(`/inventory?alt2_label=${encodeURIComponent(value.trim())}`)}
                    style={{ background: 'none', border: '1px solid transparent', padding: 0, margin: 0, cursor: 'pointer', textDecoration: 'none' }}
                  >
                    {value}
                  </button>
                );
              }

              // Zones non-cliquables: simple affichage texte
              return (
                <div
                  key={fieldKey}
                  className={`textbox-editable ${baseClass}-editable`}
                  title={`${baseClass}-editable`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
