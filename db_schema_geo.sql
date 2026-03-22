-- SQUAD PET HERO LAUNCH
-- AGENT_MAPPER: Script DDL Supabase para Geolocalização de Protetores

-- 1. Habilitar a extensão espacial e geométrica do PostgreSQL (PostGIS) nativo do Supabase
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA extensions;

-- 2. Criação da Tabela Ouro
CREATE TABLE public.protetores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    instagram VARCHAR(100) UNIQUE NOT NULL,
    
    -- Tipo nativo relacional PostGIS para armazenamento de Latitude/Longitude exatas
    -- Usaremos as coordenadas EPSG:4326 (WGS 84 - GPS Standard)
    localizacao_lat_long extensions.geography(POINT, 4326),
    
    qtd_pets INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT checagem_pets CHECK (qtd_pets >= 0)
);

-- 3. Criação de Índice Espacial para Busca Ultrarrápida no App (Adoções Próximas ao Usuário)
CREATE INDEX protetores_geo_index ON public.protetores USING GIST (localizacao_lat_long);

-- 4. Função auxiliar: Calcula a distância (em metros) entre o usuário e o protetor
CREATE OR REPLACE FUNCTION calcular_distancia_protetor(lat float, lon float)
RETURNS TABLE (
    protetor_id UUID,
    protetor_nome VARCHAR,
    distancia_metros FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id, 
        p.nome, 
        ST_Distance(
            p.localizacao_lat_long, 
            ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography
        ) AS distancia
    FROM public.protetores p
    ORDER BY distancia ASC;
END;
$$ LANGUAGE plpgsql;

-- [Opcional] Configuração de Row Level Security (RLS)
ALTER TABLE public.protetores ENABLE ROW LEVEL SECURITY;

-- Políticas Iniciais: Leitura pública do mural de adoção, Insert fechado
CREATE POLICY "Leitura Pública do Mural" 
ON public.protetores FOR SELECT 
USING (true);
