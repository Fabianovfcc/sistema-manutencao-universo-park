-- Migration aditiva: nunca remove dados existentes.
-- 1) Amplia categorias de O.S. (mantém todas as categorias atuais).
-- 2) Guarda o nome original do arquivo em manutencao_anexos (para download).
-- 3) Cria as tabelas do checklist diário de abertura.

-- ---------- 1) Categorias ----------
-- Confere que nenhuma O.S. existente ficaria fora do novo check antes de aplicar.
do $$
begin
  if exists (
    select 1 from manutencao_os
    where categoria not in (
      'Elétrica','Hidráulica','Brinquedos','Estrutura/Galpão','Desentupimento',
      'Cozinha','Bar','Salão de festa','Gel Ball','Outro'
    )
  ) then
    raise exception 'Existem O.S. com categoria fora do novo conjunto permitido — migration abortada.';
  end if;
end $$;

alter table manutencao_os drop constraint if exists manutencao_os_categoria_check;
alter table manutencao_os add constraint manutencao_os_categoria_check
  check (categoria in (
    'Elétrica','Hidráulica','Brinquedos','Estrutura/Galpão','Desentupimento',
    'Cozinha','Bar','Salão de festa','Gel Ball','Outro'
  ));

-- ---------- 2) Nome original do anexo ----------
alter table manutencao_anexos add column if not exists nome_original text;

-- ---------- 3) Checklist diário de abertura ----------
create table if not exists manutencao_checklist_itens (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  ativo boolean not null default true,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists manutencao_checklist_diario (
  id uuid primary key default gen_random_uuid(),
  data date not null unique,
  feito_por text,
  created_at timestamptz not null default now()
);

create table if not exists manutencao_checklist_respostas (
  id uuid primary key default gen_random_uuid(),
  checklist_diario_id uuid not null references manutencao_checklist_diario(id) on delete cascade,
  checklist_item_id uuid not null references manutencao_checklist_itens(id) on delete cascade,
  status text not null check (status in ('ok','nao_funcionando')),
  descricao_problema text,
  respondido_em timestamptz not null default now(),
  unique (checklist_diario_id, checklist_item_id)
);

alter table manutencao_checklist_itens enable row level security;
alter table manutencao_checklist_diario enable row level security;
alter table manutencao_checklist_respostas enable row level security;

drop policy if exists "socios autenticados - tudo" on manutencao_checklist_itens;
create policy "socios autenticados - tudo" on manutencao_checklist_itens for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "socios autenticados - tudo" on manutencao_checklist_diario;
create policy "socios autenticados - tudo" on manutencao_checklist_diario for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "socios autenticados - tudo" on manutencao_checklist_respostas;
create policy "socios autenticados - tudo" on manutencao_checklist_respostas for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed inicial dos itens (não duplica se a migration rodar de novo).
insert into manutencao_checklist_itens (titulo, ordem)
select v.titulo, v.ordem
from (values
  ('Testar todos os brinquedos', 1),
  ('Ligar todos os climatizadores', 2),
  ('Testar todos os freezers', 3),
  ('Testar sistema de incêndio', 4),
  ('Testar sistema de alarme', 5),
  ('Calibrar pneu da roda gigante', 6),
  ('Testar cesto de bolinhas do Brinquedão', 7)
) as v(titulo, ordem)
where not exists (
  select 1 from manutencao_checklist_itens existing where existing.titulo = v.titulo
);
