import { useNavigate } from 'react-router-dom';
import '../pages/Menu.css';

export default function InventoryDispatchMenu() {
  const navigate = useNavigate();

  const filterMapping = {
    DIFFUSION: 'DIFF',
    PRODUCTION: 'PROD',
    PP_DIFFUSION: 'PP_DIFF',
    PP_PRODUCTION: 'PP_PROD',
    ALL: 'ALL',
  };

  const navigateTo = (filter) => {
    if (filter === 'ALL') {
      navigate('/inventory');
    } else {
      const urlFilter = filterMapping[filter] || filter;
      navigate(`/inventory?fabrique_x=${urlFilter}`);
    }
  };

  return (
    <div className="menu-container">
      <div className="button-row">
        <button className="button" onClick={() => navigateTo('DIFFUSION')}>DIFFUSION</button>
        <button className="button" onClick={() => navigateTo('PRODUCTION')}>PRODUCTION</button>
      </div>
      <div className="button-row">
        <button className="button" onClick={() => navigateTo('PP_DIFFUSION')}>PP DIFF</button>
        <button className="button" onClick={() => navigateTo('PP_PRODUCTION')}>PP PROD</button>
      </div>
      <div className="button-row" style={{ justifyContent: 'center' }}>
        <button className="button" onClick={() => navigateTo('ALL')}>ALL</button>
      </div>
    </div>
  );
}
