create extension if not exists "pgcrypto";

create table if not exists manutencao_os (
  id uuid primary key default gen_random_uuid(),
  numero serial,
  titulo text not null,
  categoria text not null check (categoria in ('Elétrica','Hidráulica','Brinquedos','Estrutura/Galpão','Desentupimento','Outro')),
  prioridade text not null check (prioridade in ('Baixa','Média','Alta','Urgente')),
  descricao text,
  status text not null default 'afazer' check (status in ('solicitacao','afazer','andamento','aguardando','resolvido')),
  solicitante text,
  socio_responsavel text,
  empresa_executante text,
  responsavel_contato text,
  preco numeric(10,2) default 0,
  data_abertura date not null default current_date,
  data_prevista date,
  data_resolucao date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists manutencao_orcamentos (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references manutencao_os(id) on delete cascade,
  empresa text,
  contato text,
  valor numeric(10,2),
  aprovado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists manutencao_anexos (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references manutencao_os(id) on delete cascade,
  tipo text not null check (tipo in ('foto','nota_fiscal')),
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists manutencao_log (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references manutencao_os(id) on delete cascade,
  autor text,
  texto text not null,
  created_at timestamptz not null default now()
);

create table if not exists manutencao_rotinas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  freq_dias int not null,
  responsavel text,
  fornecedor text,
  telefone_fornecedor text,
  mensagem_modelo text,
  ultima_execucao date,
  created_at timestamptz not null default now()
);

create or replace function manutencao_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_manutencao_os_updated_at on manutencao_os;
create trigger trg_manutencao_os_updated_at
before update on manutencao_os
for each row execute function manutencao_set_updated_at();

alter table manutencao_os enable row level security;
alter table manutencao_orcamentos enable row level security;
alter table manutencao_anexos enable row level security;
alter table manutencao_log enable row level security;
alter table manutencao_rotinas enable row level security;

create policy "socios autenticados - tudo" on manutencao_os for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "socios autenticados - tudo" on manutencao_orcamentos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "socios autenticados - tudo" on manutencao_anexos for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "socios autenticados - tudo" on manutencao_log for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "socios autenticados - tudo" on manutencao_rotinas for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Bucket de storage privado para fotos e comprovantes das O.S.
insert into storage.buckets (id, name, public)
values ('manutencao-anexos', 'manutencao-anexos', false)
on conflict (id) do nothing;

create policy "socios autenticados - leitura anexos"
  on storage.objects for select
  using (bucket_id = 'manutencao-anexos' and auth.role() = 'authenticated');

create policy "socios autenticados - upload anexos"
  on storage.objects for insert
  with check (bucket_id = 'manutencao-anexos' and auth.role() = 'authenticated');

create policy "socios autenticados - exclusao anexos"
  on storage.objects for delete
  using (bucket_id = 'manutencao-anexos' and auth.role() = 'authenticated');
