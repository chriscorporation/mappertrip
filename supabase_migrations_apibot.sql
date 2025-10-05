-- Migraciones para API Bot
-- Estas migraciones agregan soporte para círculos y tipo "external" en todas las tablas

-- 1. Agregar columnas a la tabla airbnb
ALTER TABLE airbnb
ADD COLUMN IF NOT EXISTS circle_radius INTEGER,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN airbnb.circle_radius IS 'Radio del círculo en metros (para lugares agregados por API Bot)';
COMMENT ON COLUMN airbnb.type IS 'Tipo de origen: NULL (manual) o "external" (API Bot)';

-- 2. Agregar columnas a la tabla coworking_places
ALTER TABLE coworking_places
ADD COLUMN IF NOT EXISTS circle_radius INTEGER,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN coworking_places.circle_radius IS 'Radio del círculo en metros (para lugares agregados por API Bot)';
COMMENT ON COLUMN coworking_places.type IS 'Tipo de origen: NULL (manual) o "external" (API Bot)';

-- 3. Agregar columnas a la tabla instagramable_places
ALTER TABLE instagramable_places
ADD COLUMN IF NOT EXISTS circle_radius INTEGER,
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN instagramable_places.circle_radius IS 'Radio del círculo en metros (para lugares agregados por API Bot)';
COMMENT ON COLUMN instagramable_places.type IS 'Tipo de origen: NULL (manual) o "external" (API Bot)';

-- 4. Agregar columna type a la tabla geoplaces (circle_radius ya existe)
ALTER TABLE geoplaces
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT NULL;

COMMENT ON COLUMN geoplaces.type IS 'Tipo de origen: NULL (manual) o "external" (API Bot)';

-- Verificación de las columnas agregadas
SELECT
  'airbnb' as tabla,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'airbnb'
  AND column_name IN ('circle_radius', 'type')

UNION ALL

SELECT
  'coworking_places' as tabla,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'coworking_places'
  AND column_name IN ('circle_radius', 'type')

UNION ALL

SELECT
  'instagramable_places' as tabla,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'instagramable_places'
  AND column_name IN ('circle_radius', 'type')

UNION ALL

SELECT
  'geoplaces' as tabla,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'geoplaces'
  AND column_name IN ('circle_radius', 'type')
ORDER BY tabla, column_name;
