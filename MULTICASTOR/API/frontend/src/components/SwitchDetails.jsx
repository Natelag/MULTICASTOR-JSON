import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./SwitchDetails.css";

export default function SwitchDetails({ switchName, htmlUrl }) {
  
  const [ports, setPorts] = useState([]);
  const [switchInfo, setSwitchInfo] = useState({
    hostname: "",
    model: "",
    type: "",
    downlink: "",
    uplink: "",
  });

  const getBackgroundGradientByType = (type) => {
    const typeUpper = (type || "").trim().toUpperCase();
    switch (typeUpper) {
      case "ROUGE":
        return "linear-gradient(135deg, #5f0909ff, #910707ff)";
      case "BLEU":
        return "linear-gradient(135deg, #061c44ff, #204996ff)";
      case "ROUGEBLEU":
        return "linear-gradient(135deg, #34154c, #581299ff)";
      case "PTP":
        return "linear-gradient(135deg, #000000, #434343)";
      default:
        return "linear-gradient(135deg, #afaaaaff, #dcdcdc)";
    }
  };

  useEffect(() => {
    if (!switchName || !htmlUrl) {
      setSwitchInfo({ hostname: "", model: "", type: "", downlink: "", uplink: "" });
      setPorts([]);
      return;
    }

    fetch(htmlUrl)
      .then((res) => res.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const cells = Array.from(doc.querySelectorAll("td"));
        const rowsMap = new Map();
        cells.forEach((td) => {
          const row = td.getAttribute("data-row");
          if (!rowsMap.has(row)) rowsMap.set(row, []);
          rowsMap.get(row).push(td);
        });

        // --- Extraction infos switch ---
        let foundSwitchInfo = null;
        rowsMap.forEach((cellsInRow) => {
          const hostnameCell = cellsInRow.find(
            (td) => td.getAttribute("data-col") === "2" && td.innerText.trim() === switchName
          );
          if (hostnameCell) {
            const getCellText = (col) => {
              const cell = cellsInRow.find((td) => td.getAttribute("data-col") === col);
              if (!cell) {
                return "";
              }
              
              // Pour la colonne type (11), essayer data-hostname en priorité
              if (col === "11") {
                // Essayer dans cet ordre : data-hostname, innerText, textContent
                const hostnameAttr = cell.getAttribute("data-hostname");
                if (hostnameAttr && hostnameAttr.trim()) {
                  return hostnameAttr.trim();
                }
                const innerText = cell.innerText.trim();
                if (innerText) {
                  return innerText;
                }
                const textContent = cell.textContent.trim();
                if (textContent) {
                  return textContent;
                }
                return "";
              }
              
              // Pour les autres colonnes, utiliser innerText
              return cell.innerText.trim();
            };
            
            // Chercher automatiquement ROUGE/BLEU/PTP dans toutes les colonnes (1-20)
            let foundColorType = null;
            
            for (let col = 1; col <= 20; col++) {
              const cell = cellsInRow.find((td) => td.getAttribute("data-col") === col.toString());
              if (cell) {
                const innerText = cell.innerText.trim().toUpperCase();
                const dataHostname = (cell.getAttribute("data-hostname") || "").trim().toUpperCase();
                
                // Chercher ROUGE, BLEU, ROUGEBLEU, PTP dans cette colonne
                if (!foundColorType) {
                  if (innerText.includes("ROUGE") && innerText.includes("BLEU")) {
                    foundColorType = "ROUGEBLEU";
                  } else if (innerText.includes("ROUGE")) {
                    foundColorType = "ROUGE";
                  } else if (innerText.includes("BLEU")) {
                    foundColorType = "BLEU";
                  } else if (innerText.includes("PTP")) {
                    foundColorType = "PTP";
                  } else if (dataHostname.includes("ROUGE") && dataHostname.includes("BLEU")) {
                    foundColorType = "ROUGEBLEU";
                  } else if (dataHostname.includes("ROUGE")) {
                    foundColorType = "ROUGE";
                  } else if (dataHostname.includes("BLEU")) {
                    foundColorType = "BLEU";
                  } else if (dataHostname.includes("PTP")) {
                    foundColorType = "PTP";
                  }
                }
              }
            }
            
            // Utiliser le type couleur trouvé automatiquement, sinon utiliser colonne 11
            const finalType = foundColorType || getCellText("11");
            
            foundSwitchInfo = {
              hostname: switchName,
              model: getCellText("6"),
              type: finalType,
              downlink: getCellText("14"),
              uplink: getCellText("17"),
            };
          }
        });

        if (foundSwitchInfo) {
          setSwitchInfo(foundSwitchInfo);
        }

        // --- Extraction ports ---
        const hostnameRowEntry = Array.from(rowsMap.entries()).find(
          ([row, cellsInRow]) =>
            cellsInRow.some((td) => td.getAttribute("data-col") === "2" && td.innerText.trim() === switchName)
        );

        if (!hostnameRowEntry) {
          setPorts([]);
          return;
        }

        const hostnameRow = parseInt(hostnameRowEntry[0]);
        const rowMap = {
          oddPort: (hostnameRow + 2).toString(),
          oddType: (hostnameRow + 4).toString(),
          oddConfig: (hostnameRow + 5).toString(),
          oddHost: (hostnameRow + 6).toString(),
          evenPort: (hostnameRow + 7).toString(),
          evenType: (hostnameRow + 9).toString(),
          evenConfig: (hostnameRow + 10).toString(),
          evenHost: (hostnameRow + 11).toString(),
        };

        const extractPorts = (portRow, typeRow, configRow, hostRow) => {
          const baseCells = cells.filter((td) => td.getAttribute("data-row") === portRow);
          return baseCells
            .map((cell) => {
              const col = cell.getAttribute("data-col");
              const portNumber = cell.innerText.trim();
              const typeCell = cells.find((td) => td.getAttribute("data-row") === typeRow && td.getAttribute("data-col") === col);
              const configCell = cells.find((td) => td.getAttribute("data-row") === configRow && td.getAttribute("data-col") === col);
              const hostCell = cells.find((td) => td.getAttribute("data-row") === hostRow && td.getAttribute("data-col") === col);
              const host = hostCell?.innerText || "";
              const hostValid = host && host.trim().toUpperCase() !== "#N/A";
              const config = configCell?.innerText || "";
              const type = typeCell?.innerText || "";
              return {
                col,
                portNumber,
                type,
                config,
                host,
                hostValid,
                has100G: config.includes("100 G"),
                has400G: config.includes("400 G"),
                has1G: config.includes("1 G"),
                has10G: config.includes("10 G"),
                has25G: config.includes("25 G"),
                has40G: config.includes("40 G"),
                bg: cell.style.backgroundColor || "",
              };
            })
            .filter((p) => p.portNumber && p.portNumber.toLowerCase() !== "port");
        };

        const oddPorts = extractPorts(rowMap.oddPort, rowMap.oddType, rowMap.oddConfig, rowMap.oddHost);
        const evenPorts = extractPorts(rowMap.evenPort, rowMap.evenType, rowMap.evenConfig, rowMap.evenHost);

        setPorts([...oddPorts, ...evenPorts]);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du HTML:", err);
        setSwitchInfo({ hostname: "", model: "", type: "", downlink: "", uplink: "" });
        setPorts([]);
      });
  }, [switchName, htmlUrl]);

  const getMaxPortsByModel = (model) => {
    if (!model) return 64;
    if (model.includes("N9K-C93180YC")) return 54;
    if (model.includes("N9K-C93600CD-GX")) return 36;
    return 64;
  };

  const maxPorts = getMaxPortsByModel(switchInfo.model);
  const displayedPorts = ports.sort((a, b) => parseInt(a.portNumber) - parseInt(b.portNumber)).slice(0, maxPorts);

  const renderPortsRow = (filterFn) =>
    displayedPorts.filter(filterFn).map((port, i) => (
      <div key={i} className="port-cell">
        <div className="port-number" style={{ backgroundColor: port.bg || "#999" }}>
          {port.portNumber}
        </div>
        {[port.type, port.config].map((line, j) => {
          const style = {};
          if (j === 1 && port.has100G) style.backgroundColor = "rgba(178, 238, 178, 0.9)";
          if (j === 1 && port.has400G) { style.backgroundColor = "rgba(52, 227, 16, 0.7)"; style.color = "white"; }
          if (j === 1 && port.has1G) { style.backgroundColor = "rgba(241, 241, 153, 0.7)"; style.color = "black"; }
          if (j === 1 && port.has40G) { style.backgroundColor = "rgba(241, 179, 45, 0.7)"; style.color = "white"; }
          if (j === 1 && port.has10G) { style.backgroundColor = "rgba(251, 237, 13, 0.7)"; style.color = "black"; }
          if (j === 1 && port.has25G) { style.backgroundColor = "rgba(244, 198, 95, 0.7)"; style.color = "black"; }
          return (
            <div key={j} className="port-info" style={style}>
              {line || "—"}
            </div>
          );
        })}
        {port.hostValid &&
          port.host.split(";").map((singleHost, idx) => (
            <Link
              key={idx}
              to={`/inventory?hostname=${encodeURIComponent(singleHost.trim())}`}
              style={{ textDecoration: "underline", color: "#1547da", fontWeight: "bold", display: "block", marginBottom: "2px" }}
              title={`Voir ${singleHost.trim()} dans l'inventaire`}
            >
              {singleHost.trim()}
            </Link>
          ))}
      </div>
    ));

  const backgroundGradient = getBackgroundGradientByType(switchInfo.type);

  return (
    <div className="switch-block">
      <div
        className="content-wrapper"
        style={{ background: backgroundGradient, padding: "20px", borderRadius: "18px", marginBottom: "30px" }}
      >
        <div className="switch-info">
          <div className="switch-hostname">Hostname: <strong>{switchInfo.hostname || switchName}</strong></div>
          <div className="switch-model">Model: <strong>{switchInfo.model || "N/A"}</strong></div>
          <div className="switch-type">Type: <strong>{switchInfo.type || "N/A"}</strong></div>
          <div className="switch-downlink">Downlink: <strong>{switchInfo.downlink || "N/A"}</strong></div>
          <div className="switch-uplink">Uplink: <strong>{switchInfo.uplink || "N/A"}</strong></div>
        </div>

        <div className="switch-ports" style={{ overflowX: "auto" }}>
          <div className="port-row">{renderPortsRow((p) => parseInt(p.portNumber) % 2 === 1)}</div>
          <div className="port-row">{renderPortsRow((p) => parseInt(p.portNumber) % 2 === 0)}</div>
        </div>
      </div>
    </div>
  );
}
