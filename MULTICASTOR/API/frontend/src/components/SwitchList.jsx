import React, { useEffect, useState } from "react";
import SwitchDetails from "./SwitchDetails";
import "./SwitchList.css";
import { API_BASE_URL } from "../pages/envConfig";

export default function SwitchList({ htmlFileName, title }) {
  const [switchNames, setSwitchNames] = useState([]);

  useEffect(() => {
    if (!htmlFileName) {
      setSwitchNames([]);
      return;
    }

    const htmlUrl = `${API_BASE_URL}/export/${htmlFileName}`;

    fetch(htmlUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((htmlText) => {
        const regex = /\bSW(?:PR|DI|PP)[A-Z0-9]+(?:-[A-Za-z0-9]+)*/g;
        const matches = [...new Set(htmlText.match(regex) || [])];

        matches.sort((a, b) => {
          const getFamilyOrder = (s) => {
            const family = s.slice(0, 5);
            switch (family) {
              case "SWDIS":
              case "SWDIL":
                return 1;
              case "SWPRS":
              case "SWPRL":
                return 2;
              case "SWPPS":
              case "SWPPL":
                return 3;
              default:
                return 99;
            }
          };

          const extractNumber = (s) => {
            const match = s.slice(5).match(/^(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          };

          const famA = getFamilyOrder(a);
          const famB = getFamilyOrder(b);
          if (famA !== famB) return famA - famB;

          return extractNumber(a) - extractNumber(b);
        });

        setSwitchNames(matches);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de", htmlFileName, err);
        setSwitchNames([]);
      });
  }, [htmlFileName]);

  return (
    <main className="main page page-switch-list">
      {title && (
        <div className="switch-list-title">
          <h2 className="switch-title">
            {title} <span className="switch-count">({switchNames.length})</span>
          </h2>
        </div>
      )}

      <div className="switch-list-container">
        {switchNames.map((name) => (
          <div key={name} className="switch-list-item">
            <SwitchDetails
              switchName={name}
              htmlUrl={`${API_BASE_URL}/export/${htmlFileName}`}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
