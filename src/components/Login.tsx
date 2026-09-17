import { useState, type FormEvent, type CSSProperties } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await signIn(email, password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '32px',
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ fontSize: '28px' }}>🔧</div>
          <h1 style={{ fontSize: '20px', margin: '6px 0 0' }}>Central de Manutenção</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '13px', margin: '4px 0 0' }}>
            Universo Park — acesso de sócios
          </p>
        </div>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>
        {error && <div style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--blue)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '10px',
            fontWeight: 600,
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: CSSProperties = {
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '9px 10px',
  background: 'var(--panel-2)',
  color: 'var(--text)',
};
