import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import './CerebrumTable.css';
import { API_BASE_URL } from "./envConfig";

import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableHeader from '../components/SortableHeader';

export default function CerebrumTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const [showLicences, setShowLicences] = useState(false);
  const [showArchi, setShowArchi] = useState(false);

  const query = new URLSearchParams(useLocation().search);
  const typeParam = query.get('fabrique_x') || 'ALL';

  const VARIANT_MAP = {
    diffusion: "diff",
    production: "prod",
    pp_diffusion: "pp_diff",
    pp_production: "pp_prod",
    diff: "diff",
    prod: "prod",
    pp_diff: "pp_diff",
    pp_prod: "pp_prod",
    all: "all"
  };
  const typeKey = VARIANT_MAP[typeParam.toLowerCase()] || "all";

  const API_MAP = {
    diff: `${API_BASE_URL}/cerebrum/diff`,
    prod: `${API_BASE_URL}/cerebrum/prod`,
    pp_diff: `${API_BASE_URL}/cerebrum/pp_diff`,
    pp_prod: `${API_BASE_URL}/cerebrum/pp_prod`,
    all: `${API_BASE_URL}/cerebrum/all`
  };

  const normalizeRow = (row) => {
    const mapping = {
      "id": "id",
      "virtual": "virtual",
      "rm_mnemonic": "rm_mnemonic",
      "alt1_mnemonic": "alt1_mnemonic",
      "alt2_mnemonic": "alt2_mnemonic",
      "alt3_mnemonic": "alt3_mnemonic",
      "alt4_mnemonic": "alt4_mnemonic",
      "id_video": "id_video",
      "id_audio": "id_audio",
      "id_data": "id_data",
      "categorie_1": "categorie_1",
      "categorie_2": "categorie_2",
      "categorie_3": "categorie_3"
    };
    const newRow = {};
    Object.entries(row).forEach(([key, value]) => {
      const lcKey = key.toLowerCase().trim();
      const mappedKey = mapping[lcKey] || lcKey;
      newRow[mappedKey] = value ?? '';
    });
    return newRow;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_MAP[typeKey]);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();

        const normalizedData = (json["RM_-_Sources"] || [])
          .map(normalizeRow)
          .filter(row => {
            const val = (row.rm_mnemonic ?? '').trim();
            return val !== "RouteMaster Mnemonics" && val !== "Mnemonic";
          });

        if (normalizedData.length > 0) {
          const allCols = Object.keys(normalizedData[0]);
          const preferredOrder = [
            "id","virtual","rm_mnemonic","alt1_mnemonic","alt2_mnemonic","alt3_mnemonic",
            "alt4_mnemonic","id_video","id_audio","id_data","categorie_1","categorie_2","categorie_3"
          ];
          const ordered = [
            ...preferredOrder.filter(col => allCols.includes(col)),
            ...allCols.filter(col => !preferredOrder.includes(col))
          ];
          setColumnOrder(ordered);
        }
        setData(normalizedData);
      } catch (err) {
        console.error(err);
        setData([]);
        setColumnOrder([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [typeKey]);

  const getUniqueValues = (col) => {
    const values = new Set();
    data.forEach(row => { if (row[col]) values.add(String(row[col])); });
    return Array.from(values).sort();
  };

  const handleColumnFilterChange = (col, selectedOptions) => {
    const newValues = selectedOptions?.map(o => o.value) || [];
    setColumnFilters(prev => ({ ...prev, [col]: newValues.length ? newValues : undefined }));
  };

  const clearAllFilters = () => { setColumnFilters({}); setSearchText(''); };

  const filteredData = data.filter(row =>
    Object.entries(columnFilters).every(([key, values]) => !values || values.includes(String(row[key]))) &&
    (!searchText || Object.values(row).some(val => String(val).toLowerCase().includes(searchText.toLowerCase())))
  );

  const formatHeader = (header) => {
    if (/^alt\d?_mnemonic$/i.test(header)) {
      return header.replace(/_/g,' ').toUpperCase().replace('MNEMONIC', 'LABEL');
    }
    return header.replace(/_/g,' ').toUpperCase();
  };

  const autoFitColumn = (header) => {
    const table = document.querySelector(".inventory-table");
    if (!table) return;
    const headerCell = table.querySelector(`.col-${header}`);
    if (!headerCell) return;

    let maxWidth = headerCell.offsetWidth;

    table.querySelectorAll(`td.col-${header}`).forEach(cell => {
      const tmp = document.createElement("span");
      tmp.style.visibility = "hidden";
      tmp.style.whiteSpace = "nowrap";
      tmp.style.font = window.getComputedStyle(cell).font;
      tmp.innerText = cell.innerText || "";
      document.body.appendChild(tmp);
      maxWidth = Math.max(maxWidth, tmp.offsetWidth + 20);
      document.body.removeChild(tmp);
    });

    table.querySelectorAll(`.col-${header}`).forEach(cell => {
      cell.style.width = maxWidth + "px";
      cell.style.minWidth = maxWidth + "px";
      cell.style.maxWidth = maxWidth + "px";
    });
  };

  const licenceConfig = {
    diff: { title: "LICENCES CEREBRUM DIFF", image: "Licences_CRB_DIFF.PNG" },
    prod: { title: "LICENCES CEREBRUM PROD", image: "Licences_CRB_PROD.PNG" },
    pp_diff: { title: "LICENCES CEREBRUM PP DIFF", image: "Licences_CRB_PP_DIFF.PNG" },
    pp_prod: { title: "LICENCES CEREBRUM PP PROD", image: "Licences_CRB_PP_PROD.PNG" }
  };
  const currentLicence = licenceConfig[typeKey];

  const archiConfig = {
    diff: { title: "CEREBRUM DIFF", image: "Archi_CRB_DIFF.PNG" },
    prod: { title: "CEREBRUM PROD", image: "Archi_CRB_PROD.PNG" },
    pp_diff: { title: "CEREBRUM PP DIFF", image: "Archi_CRB_PP_DIFF.PNG" },
    pp_prod: { title: "CEREBRUM PP PROD", image: "Archi_CRB_PP_PROD.PNG" }
  };
  const currentArchi = archiConfig[typeKey];

  const sensors = useSensors(useSensor(PointerSensor));

  const exportCsv = () => {
    if (!filteredData.length) return;
    const csvHeaders = columnOrder.map(h => `"${formatHeader(h)}"`).join(';');
    const csvRows = filteredData.map(row =>
      columnOrder.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(';')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const today = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Export_Cerebrum_${typeKey}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div>Chargement...</div>;
  if (!data.length) return <p style={{ marginTop: '50px', textAlign: 'center' }}>Aucune donnée disponible</p>;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="search-input"
        />
        <button className="btn-clear-filters" onClick={clearAllFilters}>Clear Filters</button>
      </div>

      <div className="export-button-container">
        <button className="button btn-large export-button" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      {typeKey !== "all" && (
        <div className="licences-button-container">
          <button className="button btn-large licences-button" onClick={() => setShowLicences(true)}>
            LICENCES
          </button>
          <button className="button btn-large archi-button" onClick={() => setShowArchi(true)}>
            ARCHI
          </button>
        </div>
      )}

      {showLicences && currentLicence && (
        <div className="licences-popup-overlay" onClick={() => setShowLicences(false)}>
          <div className="licences-popup" onClick={(e) => e.stopPropagation()}>
            <span className="licences-popup-close" onClick={() => setShowLicences(false)}>×</span>
            <h2>{currentLicence.title}</h2>
            <img src={`/${currentLicence.image}`} alt={currentLicence.title} />
          </div>
        </div>
      )}

      {showArchi && currentArchi && (
        <div className="licences-popup-overlay" onClick={() => setShowArchi(false)}>
          <div className="licences-popup" onClick={(e) => e.stopPropagation()}>
            <span className="licences-popup-close" onClick={() => setShowArchi(false)}>×</span>
            <h2>{currentArchi.title}</h2>
            <img src={`/${currentArchi.image}`} alt={currentArchi.title} />
          </div>
        </div>
      )}

      <div className="inventory-table-container">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (active.id !== over.id) {
              const oldIndex = columnOrder.indexOf(active.id);
              const newIndex = columnOrder.indexOf(over.id);
              setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
            }
          }}
        >
          <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
            <table className="inventory-table">
              <thead>
                <tr className="sticky-header header-row no-transparency">
                  {columnOrder.map(header => (
                    <SortableHeader
                      key={header}
                      id={header}
                      onDoubleClick={() => autoFitColumn(header)}
                    >
                      {formatHeader(header)}
                    </SortableHeader>
                  ))}
                </tr>
                <tr className="sticky-header filter-row no-transparency">
                  {columnOrder.map(header => (
                    <th key={`filter-${header}`} className={`col-${header}`}>
                      <Select
                        isMulti
                        options={getUniqueValues(header).map(v => ({ value: v, label: v }))}
                        classNamePrefix="react-select"
                        value={(columnFilters[header] || []).map(v => ({ value: v, label: v }))}
                        onChange={(selected) => handleColumnFilterChange(header, selected)}
                        placeholder="All"
                        isClearable
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, i) => (
                  <tr key={i}>
                    {columnOrder.map(col => (
                      <td key={`${i}-${col}`} className={`col-${col}`} data-label={formatHeader(col)}>
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
