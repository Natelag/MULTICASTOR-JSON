import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useLocation } from "react-router-dom";
import "./App.css";

// Pages
import Menu from "./pages/Menu";
import Inventory from "./pages/Inventory";
import InventoryDispatchMenu from "./components/InventoryDispatchMenu";
import SwitchSelection from "./pages/SwitchSelection";
import SwitchDetails from "./components/SwitchDetails";
import CerebrumDetails from "./components/CerebrumDetails";
import GatewaySelection from "./pages/GatewaySelection";
import GatewayDetails from "./components/GatewayDetails";
import SwitchDiff from "./pages/SwitchDiff";
import SwitchProd from "./pages/SwitchProd";
import SwitchPP_Diff from "./pages/SwitchPP_Diff";
import SwitchPP_Prod from "./pages/SwitchPP_Prod";
import SwitchPTP from "./pages/SwitchPTP";
import GatewayDiff from "./pages/GatewayDiff";
import GatewayProd from "./pages/GatewayProd";
import GatewayPPDiff from "./pages/GatewayPPDiff";
import GatewayPPProd from "./pages/GatewayPPProd";
import CerebrumDispatchMenu from "./components/CerebrumDispatchMenu"; 
import CerebrumTable from "./pages/CerebrumTable";

// Assets
const logo = "/logo.png";
const iconMenu = "/icon-menu.png";
const iconBack = "/icon-back.png";

function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isSwitchSubPage = ["/switch/diff","/switch/prod","/switch/pp-diff","/switch/pp-prod","/switch/ptp"].some(p => location.pathname.startsWith(p));
  const isInventoryFiltered = location.pathname.startsWith("/inventory") && location.search.includes("fabrique_x=");
  const isCerebrumFiltered = location.pathname.startsWith("/cerebrum") && !location.pathname.startsWith("/cerebrum-dispatch");

  const query = new URLSearchParams(location.search);
  const cerebrumType = query.get('fabrique_x')?.toLowerCase();

  return (
    <div className="app-container">
      <header className="app-header">
        <img src={logo} alt="Logo MultiCastor" className="app-logo" />
      </header>

      <img src="/logo_FMM.png" alt="FMM Logo" className="logo-fixed-top-right" />

      <main className="main">
        <Outlet />
      </main>

      {/* Back / Menu buttons */}
      {isInventoryFiltered && (
        <Link to="/inventory-dispatch" className="icon-menu-link fixed-pos" aria-label="Retour Inventory">
          <img src={iconBack} alt="Retour inventory" className="icon-menu" />
        </Link>
      )}

      {isCerebrumFiltered && (
        <Link to="/cerebrum-dispatch" className="icon-menu-link fixed-pos" aria-label="Retour Cerebrum">
          <img src={iconBack} alt="Retour cerebrum" className="icon-menu" />
        </Link>
      )}

      {isSwitchSubPage && (
        <Link to="/switch-selection" className="icon-menu-link fixed-pos" aria-label="Retour Switch">
          <img src={iconBack} alt="Retour switch" className="icon-menu" />
        </Link>
      )}

      {/* Back pour toutes les pages Gateway */}
      {["/gateway/diff","/gateway/prod","/gateway/pp-diff","/gateway/pp-prod"].some(p => location.pathname.startsWith(p)) && (
        <Link to="/gateway-selection" className="icon-menu-link fixed-pos" aria-label="Retour Gateway">
          <img src={iconBack} alt="Retour gateway" className="icon-menu" />
        </Link>
      )}

      {location.pathname === "/cerebrum-dispatch" && (
        <Link to="/" className="icon-menu-link fixed-pos" aria-label="Menu">
          <img src={iconMenu} alt="Menu" className="icon-menu" />
        </Link>
      )}

      {/* Si aucune page spéciale, bouton Menu par défaut */}
      {!isHome && !isSwitchSubPage && !isInventoryFiltered && !isCerebrumFiltered 
        && !["/gateway/diff","/gateway/prod","/gateway/pp-diff","/gateway/pp-prod"].some(p => location.pathname.startsWith(p)) 
        && location.pathname !== "/cerebrum-dispatch" && (
          <Link to="/" className="icon-menu-link fixed-pos" aria-label="Retour menu">
            <img src={iconMenu} alt="Retour menu" className="icon-menu" />
          </Link>
      )}

      {/* Logos Walli / Nemo */}
      {isCerebrumFiltered && (["diff","pp_diff"].includes(cerebrumType)) && (
        <img id="icon-nemo" src="/icon-nemo.png" alt="Nemo" className="logo-nemo" />
      )}
      {isCerebrumFiltered && (["prod","pp_prod"].includes(cerebrumType)) && (
        <img id="icon-walli" src="/icon-walli.png" alt="Walli" className="logo-walli" />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Menu />} />

          {/* Inventory */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory-dispatch" element={<InventoryDispatchMenu />} />

          {/* Switches */}
          <Route path="switch-selection" element={<SwitchSelection />} />
          <Route path="switch/details/:switchName" element={<SwitchDetails />} />
          <Route path="switch/diff" element={<SwitchDiff />} />
          <Route path="switch/prod" element={<SwitchProd />} />
          <Route path="switch/pp-diff" element={<SwitchPP_Diff />} />
          <Route path="switch/pp-prod" element={<SwitchPP_Prod />} />
          <Route path="switch/ptp" element={<SwitchPTP />} />

          {/* Gateways */}
          <Route path="gateway-selection" element={<GatewaySelection />} />
          <Route path="gateway/diff" element={<GatewayDiff />} />
          <Route path="gateway/prod" element={<GatewayProd />} />
          <Route path="gateway/pp-diff" element={<GatewayPPDiff />} />
          <Route path="gateway/pp-prod" element={<GatewayPPProd />} />

          {/* Cerebrum dispatch */}
          <Route path="cerebrum-dispatch" element={<CerebrumDispatchMenu />} />
          <Route path="cerebrum/details/:cerebrumName" element={<CerebrumDetails />} />
          <Route path="cerebrum" element={<CerebrumTable />} />
        </Route>
      </Routes>
    </Router>
  );
}
