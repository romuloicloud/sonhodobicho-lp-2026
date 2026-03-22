-- SQUAD SONHO_DO_BICHO_ELITE
-- TARGET: echopop3_supabase
-- Comando: Simplify Relational Strategy + WhatsApp Funnel

-- Criar a tabela de Leads (Protetores/ONGs)
CREATE TABLE IF NOT EXISTS leads_pets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_protetor text NOT NULL,
  instagram_handle text NOT NULL,
  whatsapp text,
  total_pets_cadastrados integer DEFAULT 1,
  estado_uf char(2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar a tabela de Pets (Relação de múltiplos animais)
CREATE TABLE IF NOT EXISTS pets_comunidade (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES leads_pets(id) ON DELETE CASCADE,
  nome_pet text NOT NULL,
  foto_url text,
  especie text DEFAULT 'Cão',
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar segurança pública para o lançamento
ALTER TABLE leads_pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets_comunidade ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inserção pública" ON leads_pets FOR INSERT WITH CHECK (true);
CREATE POLICY "Inserção pets" ON pets_comunidade FOR INSERT WITH CHECK (true);
CREATE POLICY "Leitura mapa" ON pets_comunidade FOR SELECT USING (true);
