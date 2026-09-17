import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import KanbanBoard from './components/Board/KanbanBoard';
import RotinaTab from './components/Rotina/RotinaTab';
import RelatorioTab from './components/Relatorio/RelatorioTab';
import OSModal from './components/OSModal/OSModal';
import { useOS } from './hooks/useOS';
import { useRotinas } from './hooks/useRotinas';
import type { OS } from './types';
import './styles/common.css';

type Tab = 'quadro' | 'rotina' | 'relatorio';

function AppShell() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('quadro');
  const [modalOS, setModalOS] = useState<OS | 'new' | null>(null);

  const { osList, loading: osLoading, reload: reloadOS } = useOS();
  const { rotinas, loading: rotinasLoading, reload: reloadRotinas } = useRotinas();

  if (loading) {
    return <div style={{ padding: 40, color: 'var(--text-2)' }}>Carregando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div>
      <Header tab={tab} onTabChange={setTab} onNovaOS={() => setModalOS('new')} />

      {tab === 'quadro' && (
        <KanbanBoard osList={osList} loading={osLoading} onOpen={(os) => setModalOS(os)} onChanged={reloadOS} />
      )}
      {tab === 'rotina' && (
        <RotinaTab rotinas={rotinas} loading={rotinasLoading} onChanged={reloadRotinas} />
      )}
      {tab === 'relatorio' && <RelatorioTab osList={osList} rotinas={rotinas} />}

      {modalOS && (
        <OSModal
          os={modalOS === 'new' ? null : modalOS}
          osList={osList}
          onClose={() => setModalOS(null)}
          onSaved={reloadOS}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
