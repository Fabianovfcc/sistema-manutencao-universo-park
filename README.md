# Central de Manutenção — Universo Park

React + Vite + TypeScript + Supabase.

**Produção:** https://sistema-manutencao-universo-park.vercel.app

## Rodando localmente

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` com as chaves do projeto Supabase (`coxsuxihsswfpgyssnry`).
3. Aplique a migration em `supabase/migrations/` no projeto Supabase (SQL Editor ou `supabase db push` depois de `supabase link`).
4. Crie ao menos um usuário em Authentication → Users (e-mail/senha) para conseguir logar.
5. `npm run dev`

## Deploy

Hospedado no Vercel (projeto `fabiano-s-projects14/sistema-manutencao-universo-park`). Para publicar uma nova versão:

```
npx vercel --prod --yes
```

As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` já estão configuradas no ambiente de produção do projeto Vercel.

## Estrutura

- `src/components/Board` — Kanban (aba Quadro)
- `src/components/OSModal` — modal de criação/edição de O.S.
- `src/components/Rotina` — manutenções recorrentes
- `src/components/Relatorio` — estatísticas e histórico
- `src/lib` — cliente Supabase, API e utilitários
- `supabase/migrations` — schema do banco
