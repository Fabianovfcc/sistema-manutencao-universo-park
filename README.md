# Central de Manutenção — Universo Park

React + Vite + TypeScript + Supabase.

**Produção:** https://fabianovfcc.github.io/sistema-manutencao-universo-park/

Login é por nome (não e-mail): o nome digitado vira um e-mail sintético `nome@universopark.app` internamente (veja `src/lib/username.ts`). Crie os usuários correspondentes em Authentication → Users no Supabase.

## Rodando localmente

1. `npm install`
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` com as chaves do projeto Supabase (`coxsuxihsswfpgyssnry`).
3. Aplique a migration em `supabase/migrations/` no projeto Supabase (SQL Editor ou `supabase db push` depois de `supabase link`).
4. Crie ao menos um usuário em Authentication → Users (e-mail/senha) para conseguir logar.
5. `npm run dev`

## Deploy

Hospedado no GitHub Pages (branch `gh-pages`, repositório público). Vercel/Netlify/Wrangler tiveram problemas persistentes de deploy (builds travando/crashando) nesta máquina, então o deploy é feito publicando a pasta `dist/` diretamente:

```
npm run build
cd dist
git init && git checkout -b gh-pages
git add -A && git commit -m "Deploy GitHub Pages"
git push -f https://github.com/Fabianovfcc/sistema-manutencao-universo-park.git HEAD:gh-pages
cd ..
```

`vite.config.ts` define `base: '/sistema-manutencao-universo-park/'` para os caminhos dos assets funcionarem sob esse subcaminho. O `.env` (com as chaves reais do Supabase) já está presente localmente no build.

## Estrutura

- `src/components/Board` — Kanban (aba Quadro)
- `src/components/OSModal` — modal de criação/edição de O.S.
- `src/components/Rotina` — manutenções recorrentes
- `src/components/Relatorio` — estatísticas e histórico
- `src/lib` — cliente Supabase, API e utilitários
- `supabase/migrations` — schema do banco
