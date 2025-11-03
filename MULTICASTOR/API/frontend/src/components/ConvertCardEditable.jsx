import React from "react";
import { useNavigate } from "react-router-dom";
import "./ConvertCardEditable.css";

export default function ConvertCardEditable({ hostCards }) {
  if (!hostCards || hostCards.length === 0) return null;
  const navigate = useNavigate();

  return (
    <div className="editable-page-convert">
      {hostCards.map((equip, idx) => (
        <div className="convert-card-editable" key={idx}>
          {/* Image de fond */}
          <img
            src="/Neuron_CONVERT.png"
            alt="Convert template"
            className="convert-template-editable"
          />
          {/* Calque des textbox */}
          <div className="convert-content-editable">
            {Object.entries(equip.fields).map(([fieldKey, value]) => {
              // Normaliser le nom de classe attendu
              const baseClass = fieldKey.startsWith("box-") ? fieldKey : `box-${fieldKey}`;
              // Clic autorisé pour IN1..8, OUT1..24, IO9..32(IN|OUT); jamais pour ...CONV*
              const isClickable = (
                /^box-(IN[1-8]|OUT([1-8]|[9]|1[0-9]|2[0-4]))$/.test(baseClass) ||
                /^box-IO(9|1[0-9]|2[0-9]|3[0-2])(IN|OUT)$/.test(baseClass) ||
                /^box-IN([1-9]|1[0-9]|2[0-4])$/.test(baseClass)
              ) && !/CONV/.test(baseClass);
              const isHostname = baseClass === 'box-HOSTNAME';

              if (isHostname) {
                return (
                  <button
                    key={fieldKey}
                    className={`textbox-convert-editable is-clickable ${baseClass}-convert-editable`}
                    title={`${baseClass}-convert-editable`}
                    onClick={() => typeof value === 'string' && value.trim() && navigate(`/inventory?hostname=${encodeURIComponent(value.trim())}`)}
                    style={{ background: 'none', border: '1px solid transparent', padding: 0, margin: 0, cursor: 'pointer', textDecoration: 'none' }}
                  >
                    {value}
                  </button>
                );
              }

              if (isClickable) {
                return (
                  <button
                    key={fieldKey}
                    className={`textbox-convert-editable is-clickable ${baseClass}-convert-editable`}
                    title={`${baseClass}-convert-editable`}
                    onClick={() => typeof value === 'string' && value.trim() && navigate(`/inventory?alt2_label=${encodeURIComponent(value.trim())}`)}
                    style={{ background: 'none', border: '1px solid transparent', padding: 0, margin: 0, cursor: 'pointer', textDecoration: 'none' }}
                  >
                    {value}
                  </button>
                );
              }

              return (
                <div
                  key={fieldKey}
                  className={`textbox-convert-editable ${baseClass}-convert-editable`}
                  title={`${baseClass}-convert-editable`}
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


