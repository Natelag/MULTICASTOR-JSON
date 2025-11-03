import MainButton from '../components/MainButton';
import { useNavigate } from 'react-router-dom';
import './Menu.css';

export default function Menu() {
  const navigate = useNavigate();

  return (
    <div className="menu-container">
      {/* Ligne 1 : Inventory seul, centré */}
      <div className="button-row" style={{ justifyContent: 'center' }}>
        <MainButton label="Inventory" onClick={() => navigate('/inventory-dispatch')} />
      </div>

      {/* Ligne 2 : Switches, Cerebrum, Gateways */}
      <div className="button-row" style={{ justifyContent: 'center' }}>
        <MainButton label="Switches" onClick={() => navigate('/switch-selection')} />
        <MainButton label="Cerebrum" onClick={() => navigate('/cerebrum-dispatch')} />
        <MainButton label="Gateways" onClick={() => navigate('/gateway-selection')} />
      </div>
    </div>
  );
}
