import { useRef } from 'react';
import type { UIAnexo } from './types';

interface Props {
  titulo: string;
  anexos: UIAnexo[];
  accept: string;
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}

export default function AnexosSection({ titulo, anexos, accept, onAdd, onRemove }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);

  return (
    <div className="modal-section">
      <h3>{titulo}</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => cameraRef.current?.click()}>
          📷 Tirar foto
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => galeriaRef.current?.click()}>
          Escolher da galeria
        </button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept={accept}
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) onAdd(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={galeriaRef}
        type="file"
        accept={accept}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) onAdd(e.target.files);
          e.target.value = '';
        }}
      />
      {anexos.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {anexos.map((a) => (
            <div
              key={a.id}
              style={{
                position: 'relative',
                width: 84,
                height: 84,
                borderRadius: 8,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: 'var(--panel-2)',
              }}
            >
              {a.isPdf ? (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    fontSize: 12,
                    textAlign: 'center',
                    padding: 4,
                  }}
                >
                  📄 Ver comprovante
                </a>
              ) : (
                <img src={a.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  lineHeight: '20px',
                  padding: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
