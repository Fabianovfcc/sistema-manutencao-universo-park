import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import './Header.css';

type Tab = 'quadro' | 'rotina' | 'relatorio';

interface Props {
  tab: Tab;
  onTabChange: (t: Tab) => void;
  onNovaOS: () => void;
}

export default function Header({ tab, onTabChange, onNovaOS }: Props) {
  const { socioNome, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="app-header-top">
        <div>
          <h1>🔧 Central de Manutenção</h1>
          <p>Universo Park — elétrica, hidráulica, brinquedos e estrutura</p>
        </div>
        <div className="app-header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-primary" onClick={onNovaOS}>
            + Nova O.S.
          </button>
          <div className="app-header-user">
            <span className="mono">{socioNome}</span>
            <button className="btn btn-ghost" onClick={signOut}>
              Sair
            </button>
          </div>
        </div>
      </div>
      <nav className="app-tabs">
        <button
          className={tab === 'quadro' ? 'app-tab active' : 'app-tab'}
          onClick={() => onTabChange('quadro')}
        >
          Quadro
        </button>
        <button
          className={tab === 'rotina' ? 'app-tab active' : 'app-tab'}
          onClick={() => onTabChange('rotina')}
        >
          Rotina
        </button>
        <button
          className={tab === 'relatorio' ? 'app-tab active' : 'app-tab'}
          onClick={() => onTabChange('relatorio')}
        >
          Relatório
        </button>
      </nav>
    </header>
  );
}
