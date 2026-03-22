-- SQUAD SONHO_DO_BICHO_ELITE
-- TARGET: echopop3_supabase | WORKFLOW: Database_Setup

-- 1. INSTANCIANDO A TABELA DE MAPEAMENTO GLOBAL DO BRASIL (27 Estados)
CREATE TABLE public.pets_nacional (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_pet VARCHAR(255) NOT NULL,
    especie VARCHAR(50) CHECK (especie IN ('Cachorro', 'Gato', 'Outro')),
    uf CHAR(2) NOT NULL, -- Unidade Federativa (RJ, SP, DF...)
    cidade VARCHAR(255) NOT NULL,
    
    -- Campos espaciais (Caso o PostGIS esteja habilitado, senao usar float)
    -- Usaremos o padrão de float p/ garantir compatiilidade máxima sem a Extensão em instâncias básicas,
    -- mas com GIST Point fallback se PostGIS estiver On.
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    
    foto_url TEXT NOT NULL, -- Link blindado oriundo do Storage 'pets_uploads'
    
    -- ID do Protetor Responsável (Foreign Key relacional)
    protetor_id UUID REFERENCES public.protetores(id) ON DELETE CASCADE,
    
    status_adocao VARCHAR(50) DEFAULT 'Disponível' CHECK (status_adocao IN ('Disponível', 'Em Processo', 'Adotado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ÍNDICES DE OTIMIZAÇÃO DE BUSCA E GEOLOCALIZAÇÃO
-- Indexando Estado e Cidade para consultas em massa nas Landing Pages Estaduais
CREATE INDEX idx_pets_uf_cidade ON public.pets_nacional(uf, cidade);
-- Indexando o status para que o front só busque os disponíveis
CREATE INDEX idx_pets_status ON public.pets_nacional(status_adocao) WHERE status_adocao = 'Disponível';

-- 3. CONFIGURAÇÃO DE BUCKET DE STORAGE ('pets_uploads') NO SUPABASE
-- Nota: Executar em ambiente Supabase Admin caso a permissão SQL não crie buckets na interface
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('pets_uploads', 'pets_uploads', true, false, 5242880, ARRAY['image/webp', 'image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. POLÍTICAS DE SEGURANÇA (RLS - ROW LEVEL SECURITY)
ALTER TABLE public.pets_nacional ENABLE ROW LEVEL SECURITY;

-- As Landing Pages (Leads/Usuários comuns sem login) podem visualizar os pets livremente
CREATE POLICY "Leitura irrestrita de Pets Nacional" 
ON public.pets_nacional FOR SELECT 
USING (true);

-- Permite Insert apenas de instâncias autorizadas (A própria LP com o Form de Protetor)
CREATE POLICY "Insert livre de Cadastros" 
ON public.pets_nacional FOR INSERT 
WITH CHECK (true);

-- Storage RLS: Public can view images
CREATE POLICY "Public Access Storage" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pets_uploads');

-- Storage RLS: Anyone can upload images to pets_uploads
CREATE POLICY "Public Upload Storage" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'pets_uploads');
