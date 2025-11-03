import { useNavigate } from 'react-router-dom';
import '../pages/Menu.css';

export default function CerebrumDispatchMenu() {
  const navigate = useNavigate();

  const filterMapping = {
    DIFFUSION: 'diff',
    PRODUCTION: 'prod',
    PP_DIFFUSION: 'pp_diff',
    PP_PRODUCTION: 'pp_prod',
    ALL: 'all',
  };

  const navigateTo = (filter) => {
    const urlFilter = filterMapping[filter] || filter;
    navigate('/cerebrum?fabrique_x=' + urlFilter, { state: { type: urlFilter } });
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
