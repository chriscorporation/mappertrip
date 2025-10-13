# Operations Scripts Documentation

Este directorio contiene scripts de operaciones para sincronizar y poblar datos en la base de datos.

---

## 📄 sync-database-from-json.js

**Propósito**: Sincronizar barrios/zonas desde `geo_json` hacia `geoplaces` con cálculo automático de centroides.

**Ejecución**:
```bash
node operations/sync-database-from-json.js field=name3 value="CIUDAD AUTONOMA DE BUENOS AIRES"
node operations/sync-database-from-json.js field=name2 value="ALMAGRO"
node operations/sync-database-from-json.js help
```

**Flujo**:
1. Lee registros desde `geo_json` filtrados por campo dinámico (name1, name2, name3)
2. Compara con registros existentes en `geoplaces` (por `address` e `id_ref`)
3. Calcula centroide automáticamente desde el polígono GeoJSON
4. Inserta o actualiza según corresponda

**Actualiza en geoplaces**:

| Operación | Campos | Condición |
|-----------|--------|-----------|
| **INSERT** | `address`, `id_ref`, `country_code`, `lat`, `lng`, `polygon`, `type`, `status` | Registro no existe |
| **UPDATE** | `status` = 'PENDING' | Registro existe y `status` es null |

**Validaciones**:
- Requiere argumentos obligatorios (no permite ejecución sin parámetros)
- Evita duplicados comparando `address` normalizado e `id_ref`
- Solo actualiza status si está vacío/null

---

## 📄 sync-polygons.js

**Propósito**: Sincronizar polígonos desde `geo_json` hacia `geoplaces` existentes basándose en coincidencias de nombres.

**Ejecución**:
```bash
node operations/sync-polygons.js
```

**Flujo**:
1. Lee todos los registros de `geoplaces`
2. Lee todos los registros de `geo_json`
3. Busca coincidencias por nombre con algoritmo multi-paso:
   - Paso 1: Match exacto en `name2`
   - Paso 2: Match exacto en `name1`
   - Paso 3: Match por región (CABA vs Provincia)
   - Paso 4: Match parcial con word boundary
4. Actualiza registros que coinciden

**Actualiza en geoplaces**:

| Operación | Campos | Condición |
|-----------|--------|-----------|
| **UPDATE** | `polygon`, `id_ref` | Match encontrado entre `geoplaces.address` y `geo_json.name1/name2` |

**Características**:
- Normaliza texto (sin acentos, mayúsculas) para comparaciones
- Distingue entre CABA y Provincia de Buenos Aires
- No requiere argumentos

---

## 📄 set-information.js

**Propósito**: Poblar información adicional (Perplexity AI) para zonas que aún no han sido procesadas.

**Ejecución**:
```bash
node operations/set-information.js
```

**Flujo**:
1. **Valida** que el servidor Next.js esté corriendo en `http://localhost:3025`
2. Busca zonas con `active=null` en `geoplaces`
3. Para cada zona, llama al endpoint `/api/perplexity-populate` con el `zone_id`
4. Espera 25 segundos entre llamadas (rate limiting)
5. Genera reporte de éxitos/errores

**Actualiza en geoplaces** (vía `/api/perplexity-populate`):

| Operación | Campos | Condición |
|-----------|--------|-----------|
| **UPDATE** (indirecto) | `orientation`, `insecurity_level_id`, `active`, `status` | Vía endpoint después de procesar Perplexity AI |

**Actualiza en perplexity_notes** (vía `/api/perplexity-populate`):

| Operación | Campos | Condición |
|-----------|--------|-----------|
| **UPSERT** (indirecto) | `notes`, `rent`, `tourism`, `secure`, `places` | Vía endpoint con datos de Perplexity AI |

**Validaciones**:
- ❌ Servidor no corriendo en `http://localhost:3025` → Exit con instrucciones
- ❌ No hay zonas con `active=null` → Exit con mensaje informativo
- ⚠️ Error por zona individual → Continúa con la siguiente

**Características**:
- No actualiza bases de datos directamente, delega al endpoint
- Procesa secuencialmente con delay de 25 segundos (rate limiting de Perplexity)
- Requiere servidor Next.js corriendo antes de ejecutar

---

## 🔄 Flujo Recomendado

Para poblar una nueva región completamente:

```bash
# 1. Sincronizar barrios desde geo_json a geoplaces
node operations/sync-database-from-json.js field=name3 value="CIUDAD AUTONOMA DE BUENOS AIRES"

# 2. (Opcional) Actualizar polígonos de registros existentes
node operations/sync-polygons.js

# 3. Poblar información adicional vía Perplexity AI
node operations/set-information.js
```

---

## 📋 Notas Importantes

- **sync-database-from-json.js**: Requiere argumentos obligatorios para evitar ejecuciones accidentales
- **sync-polygons.js**: Útil para actualizar polígonos de registros creados manualmente
- **set-information.js**: Requiere que el servidor Next.js esté corriendo
- Todos los scripts usan normalización de texto para comparaciones confiables
- El campo `country_code` está hardcodeado como 'AR' en algunos scripts
