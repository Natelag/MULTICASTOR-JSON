import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Select from 'react-select';
import './Inventory.css';
import { INVENTORY_URL } from './envConfig';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import SortableHeader from '../components/SortableHeader';

// Hook pour récupérer les query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Normalise les clés du JSON et applique un mapping simple
function normalizeAndFilterKeys(row) {
  const mapping = {
    hostname: "hostname",
    fabrique: "fabrique",
    fonction: "fonction",
    multicast_r: "multicast_r",
    port_multi_r: "port_multi_r",
    unicast_r: "unicast_r",
    switch_r: "switch_r",
    port_r: "port_r",
    multicast_b: "multicast_b",
    port_multi_b: "port_multi_b",
    unicast_b: "unicast_b",
    switch_b: "switch_b",
    port_b: "port_b",
    stream: "stream",
    flux: "flux",
    type: "type",
    endpoint_label: "endpoint_label",
    rm_mnemonic: "rm_mnemonic",
    alt1_label: "alt1_label",
    alt2_label: "alt2_label",
    alt3_label: "alt3_label",
    alt4_label: "alt4_label",
    categorie_1: "categorie_1",
    categorie_2: "categorie_2",
    categorie_3: "categorie_3",
    rm_id: "rm_id",
    rm_virtual: "rm_virtual",
    port_type: "port_type",
    ref_sfp_device: "ref_sfp_device",
    ref_sfp_switch_r: "ref_sfp_switch_r",
    ref_sfp_switch_b: "ref_sfp_switch_b",
    groupe: "groupe",
    zone: "zone",
  };

  const newRow = {};
  Object.entries(row).forEach(([key, value]) => {
    const lcKey = key.toLowerCase().trim();
    const mappedKey = mapping[lcKey] || lcKey;
    newRow[mappedKey] = value ?? '';
  });
  return newRow;
}

export default function Inventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [columnFilters, setColumnFilters] = useState({});
  const [columnOrder, setColumnOrder] = useState([]);
  const tableRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();

  const desiredOrder = [
    "hostname", "fabrique", "fonction",
    "multicast_r", "port_multi_r", "unicast_r", "switch_r", "port_r",
    "multicast_b", "port_multi_b", "unicast_b", "switch_b", "port_b",
    "flux", "type", "stream", "groupe", "zone",
    "endpoint_label", "rm_mnemonic",
    "alt1_label","alt2_label","alt3_label","alt4_label",
    "categorie_1","categorie_2","categorie_3",
    "rm_id","rm_virtual","ref_sfp_device",
    "ref_sfp_switch_r","ref_sfp_switch_b","port_type"
  ];

  // --- Init filtres depuis URL (fabrique, hostname, alt2_label)
  useEffect(() => {
    const fabParam = query.get("fabrique") || query.get("fabrique_x") || "ALL";
    const hostParam = query.get("hostname");
    const alt2Param = query.get("alt2_label");
    setColumnFilters({
      fabrique: fabParam === "ALL" ? undefined : [fabParam],
      hostname: hostParam ? [hostParam] : undefined,
      alt2_label: alt2Param ? [alt2Param] : undefined,
    });
  }, [location.search]);

  // --- Fetch JSON Inventory et normaliser les clés ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(INVENTORY_URL);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const json = await res.json();
        const normalizedData = json.map(normalizeAndFilterKeys);
        setData(normalizedData);
        if (normalizedData.length > 0) {
          const cols = desiredOrder.filter(c => c in normalizedData[0]);
          setColumnOrder(cols);
        }
      } catch (err) {
        console.error(err);
        setData([]);
        setColumnOrder([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- Utilitaires ---
  const getUniqueValues = (col) => {
    const values = new Set();
    data.forEach(row => {
      if (row[col]) values.add(String(row[col]));
    });
    return Array.from(values).sort();
  };

  const handleColumnFilterChange = (col, selectedOptions) => {
    const newValues = selectedOptions?.map(o => o.value) || [];
    setColumnFilters(prev => ({ ...prev, [col]: newValues.length ? newValues : undefined }));
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchText('');
  };

  const filteredData = data.filter(row =>
    Object.entries(columnFilters).every(([key, values]) =>
      !values || values.includes(String(row[key]))
    ) &&
    (!searchText || Object.values(row).some(val =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    ))
  );

  const formatHeader = (header) => header.replace(/_/g, ' ').toUpperCase();
  const sensors = useSensors(useSensor(PointerSensor));

  // Auto-fit d'une colonne via double-clic entête
  const handleAutoFit = (colIndex) => {
    if (!tableRef.current) return;
    const table = tableRef.current;
    const th = table.querySelector(`thead tr:first-child th:nth-child(${colIndex + 1})`);
    const cells = table.querySelectorAll(`tbody tr td:nth-child(${colIndex + 1})`);
    let maxWidth = th ? th.scrollWidth : 0;
    cells.forEach(td => { maxWidth = Math.max(maxWidth, td.scrollWidth); });
    table.querySelectorAll('tr').forEach(tr => {
      const cell = tr.children[colIndex];
      if (cell) {
        cell.style.minWidth = `${maxWidth + 20}px`;
        cell.style.width = `${maxWidth + 20}px`;
      }
    });
  };

  const onClickHostname = (hostname) => {
    if (hostname) navigate(`/switch-selection?selectedSwitch=${encodeURIComponent(hostname)}`);
  };

  const onClickGatewayHostname = (hostname) => {
    if (hostname) navigate(`/gateway-selection?selectedGateway=${encodeURIComponent(hostname)}`);
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      Chargement...
    </div>
  );

  if (!data.length) return <p style={{ marginTop: '50px', textAlign: 'center' }}>Aucune donnée disponible</p>;

  return (
    <div className="inventory-container">
      {(columnFilters?.fabrique?.some(f => ['PROD', 'PP_PROD'].includes(f))) && (
        <img id="icon-walli" src="/icon-walli.png" alt="Walli" />
      )}
      {(columnFilters?.fabrique?.some(f => ['DIFF', 'PP_DIFF'].includes(f))) && (
        <img id="icon-nemo" src="/icon-nemo.png" alt="Nemo" />
      )}

      <div className="inventory-header">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="search-input"
        />
        <button className="btn-clear-filters" onClick={clearAllFilters}>
          Clear Filters
        </button>
      </div>

      <div className="export-button-container">
        <button
          className="button btn-large export-button"
          onClick={() => {
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
            link.setAttribute('download', `Export_Database_2110_FMM_${today}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          Export CSV
        </button>
      </div>

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
            <table className="inventory-table" ref={tableRef}>
              <thead>
                <tr className="sticky-header header-row no-transparency">
                  {columnOrder.map((header, idx) => (
                    <SortableHeader key={header} id={header} onDoubleClick={() => handleAutoFit(idx)}>
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
                        onChange={selected => handleColumnFilterChange(header, selected)}
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
                    {columnOrder.map((col, colIndex) => {
                      let cellContent = row[col];

                      if ((col === 'switch_r' || col === 'switch_b') && row[col]) {
                        cellContent = (
                          <button
                            onClick={() => onClickHostname(row[col])}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              color: col === 'switch_r' ? '#e64848' : '#489ce6'
                            }}
                          >
                            {row[col]}
                          </button>
                        );
                      }

                      if (col === 'hostname' && typeof row[col] === 'string') {
                        const host = row[col].trim();
                        if (/^(STP-GWNRC|ST-GWNRC)/.test(host)) {
                          cellContent = (
                            <button
                              onClick={() => onClickGatewayHostname(host)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit',
                                fontWeight: 700
                              }}
                              title={`Voir ${host} dans Gateway Selection`}
                            >
                              {host}
                            </button>
                          );
                        }
                      }

                      const isSticky = colIndex === 0;
                      const cellStyle = {
                        ...(
                          col === 'flux'
                            ? {
                                backgroundColor: row[col] === 'VIDEO_01'
                                  ? '#2557de'
                                  : ['AUDIO_01', 'AUDIO_02'].includes(row[col])
                                    ? '#30b23f'
                                    : row[col] === 'DATA_01'
                                      ? '#c0c91c'
                                      : 'transparent',
                                color: 'black'
                              }
                            : {}
                        ),
                        ...(isSticky ? {
                           position: 'sticky',
                           left: 0,
                           zIndex: 3,
                           backgroundColor: 'transparent', // plus de fond blanc
                           backdropFilter: 'blur(12px)',   // floute légèrement ce qui est derrière
                            WebkitBackdropFilter: 'blur(12px)', // support Safari
                           
                        } : {})

                      };

                      return (
                        <td key={`${i}-${col}`} className={`col-${col}`} style={cellStyle} data-label={formatHeader(col)}>
                          {cellContent}
                        </td>
                      );
                    })}
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
