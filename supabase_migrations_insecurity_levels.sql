-- =====================================================
-- MIGRACIÓN: Tablas de Niveles de Inseguridad y Colores
-- =====================================================
-- Fecha: 2025-10-05
-- Descripción: Normalización de colores y niveles de seguridad
--              para evitar hardcodear valores en el código
-- =====================================================

-- Tabla de colores
CREATE TABLE IF NOT EXISTS color_insecurity (
  id integer PRIMARY KEY,
  name text NOT NULL,
  hex_code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Tabla de niveles de inseguridad
CREATE TABLE IF NOT EXISTS insecurity_level (
  id integer PRIMARY KEY,
  name text NOT NULL UNIQUE,
  color_id integer NOT NULL REFERENCES color_insecurity(id),
  created_at timestamptz DEFAULT now()
);

-- Insertar los colores
INSERT INTO color_insecurity (id, name, hex_code) VALUES
(0, 'green', '#00C853'),
(1, 'blue', '#2196F3'),
(2, 'orange', '#FF9800'),
(3, 'yellow', '#FFC107'),
(4, 'red', '#F44336')
ON CONFLICT (id) DO NOTHING;

-- Insertar los niveles de inseguridad
INSERT INTO insecurity_level (id, name, color_id) VALUES
(0, 'seguro', 0),
(1, 'medio', 1),
(2, 'regular', 2),
(3, 'precaucion', 3),
(4, 'inseguro', 4)
ON CONFLICT (id) DO NOTHING;

-- Añadir columna insecurity_level_id a geoplaces
ALTER TABLE geoplaces
ADD COLUMN IF NOT EXISTS insecurity_level_id integer REFERENCES insecurity_level(id);

-- Migrar datos existentes basados en el color
UPDATE geoplaces
SET insecurity_level_id = CASE
  WHEN color = '#00C853' THEN 0
  WHEN color = '#2196F3' THEN 1
  WHEN color = '#FF9800' THEN 2
  WHEN color = '#FFC107' THEN 3
  WHEN color = '#F44336' THEN 4
  WHEN color = '#22c55e' THEN 0  -- Legacy verde
  WHEN color = '#eb4034' THEN 4  -- Legacy rojo
  ELSE 0  -- Default: seguro
END
WHERE insecurity_level_id IS NULL;

-- Comentarios para documentación
COMMENT ON TABLE color_insecurity IS 'Catálogo de colores para niveles de inseguridad';
COMMENT ON TABLE insecurity_level IS 'Catálogo de niveles de inseguridad con sus colores asociados';
COMMENT ON COLUMN geoplaces.insecurity_level_id IS 'Nivel de inseguridad de la zona (referencia a insecurity_level)';

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los niveles de inseguridad con sus colores
-- SELECT
--   il.id,
--   il.name as nivel,
--   ci.name as color_name,
--   ci.hex_code
-- FROM insecurity_level il
-- JOIN color_insecurity ci ON il.color_id = ci.id
-- ORDER BY il.id;

-- Ver zonas con su nivel de seguridad
-- SELECT
--   g.id,
--   g.address,
--   il.name as nivel_seguridad,
--   ci.hex_code as color
-- FROM geoplaces g
-- LEFT JOIN insecurity_level il ON g.insecurity_level_id = il.id
-- LEFT JOIN color_insecurity ci ON il.color_id = ci.id
-- ORDER BY g.created_at DESC;
