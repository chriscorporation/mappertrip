# API Bot - Documentación

API para alimentar datos de lugares desde fuentes externas (Telegram Bot, etc.)

## Endpoint

**POST** `https://mappertrip.vercel.app/api/apibot`

## Parámetros

### Requeridos (todos los tipos)

| Parámetro | Tipo | Opciones | Descripción |
|-----------|------|----------|-------------|
| `type` | string | `zone`, `airbnb`, `coworking`, `instagramable` | Tipo de lugar a crear |
| `title` | string | - | Nombre/título del lugar |
| `lat` | number | - | Latitud |
| `lng` | number | - | Longitud |
| `radius_km` | number | `0.5`, `1`, `2` | Radio del círculo en kilómetros |
| `country_code` | string | `AR`, `MX`, `BR`, etc. | Código de país (ISO 3166-1 alpha-2) |

### Opcional (solo para zonas)

| Parámetro | Tipo | Opciones | Descripción |
|-----------|------|----------|-------------|
| `safety_level` | string | `seguro`, `medio`, `regular`, `precaucion`, `inseguro` | Nivel de seguridad (REQUERIDO para `type=zone`) |

## Niveles de Seguridad (solo para zonas)

Los niveles de seguridad están almacenados en la tabla `insecurity_level` con sus colores correspondientes en `color_insecurity`.

| ID | Nivel | Color | Emoji | Descripción |
|----|-------|-------|-------|-------------|
| `0` | `seguro` | `#00C853` | 🟢 | Zona segura |
| `1` | `medio` | `#2196F3` | 🔵 | Seguridad media |
| `2` | `regular` | `#FF9800` | 🟠 | Seguridad regular |
| `3` | `precaucion` | `#FFC107` | 🟡 | Precaución |
| `4` | `inseguro` | `#F44336` | 🔴 | Zona insegura |

**Nota:** Los colores se obtienen automáticamente de la base de datos. No es necesario especificar el color, solo el `safety_level`.

## Ejemplos de Uso

### 1. Crear Zona Segura

```bash
curl -X POST https://mappertrip.vercel.app/api/apibot \
  -H "Content-Type: application/json" \
  -d '{
    "type": "zone",
    "title": "Polanco CDMX",
    "lat": 19.4326,
    "lng": -99.1332,
    "radius_km": 1,
    "safety_level": "seguro",
    "country_code": "MX"
  }'
```

### 2. Crear Zona Insegura

```bash
curl -X POST https://mappertrip.vercel.app/api/apibot \
  -H "Content-Type: application/json" \
  -d '{
    "type": "zone",
    "title": "Tepito CDMX",
    "lat": 19.4489,
    "lng": -99.1236,
    "radius_km": 0.5,
    "safety_level": "inseguro",
    "country_code": "MX"
  }'
```

### 3. Crear Coworking

```bash
curl -X POST https://mappertrip.vercel.app/api/apibot \
  -H "Content-Type: application/json" \
  -d '{
    "type": "coworking",
    "title": "WeWork Reforma",
    "lat": 19.4284,
    "lng": -99.1678,
    "radius_km": 0.5,
    "country_code": "MX"
  }'
```

### 4. Crear Lugar Instagramable

```bash
curl -X POST https://mappertrip.vercel.app/api/apibot \
  -H "Content-Type: application/json" \
  -d '{
    "type": "instagramable",
    "title": "Ángel de la Independencia",
    "lat": 19.4270,
    "lng": -99.1677,
    "radius_km": 0.5,
    "country_code": "MX"
  }'
```

### 5. Crear Airbnb

```bash
curl -X POST https://mappertrip.vercel.app/api/apibot \
  -H "Content-Type: application/json" \
  -d '{
    "type": "airbnb",
    "title": "Departamento Centro Histórico",
    "lat": 19.4326,
    "lng": -99.1332,
    "radius_km": 0.5,
    "country_code": "MX"
  }'
```

## Respuesta Exitosa

```json
{
  "success": true,
  "message": "zone creado exitosamente",
  "data": {
    "id": 123,
    "address": "Polanco CDMX",
    "lat": 19.4326,
    "lng": -99.1332,
    "circle_radius": 1000,
    "color": "#00C853",
    "country_code": "MX",
    "type": "external",
    "created_at": "2025-10-05T12:00:00Z"
  },
  "radius_km": 1,
  "radius_meters": 1000
}
```

## Errores

### 400 Bad Request

```json
{
  "error": "Faltan parámetros requeridos: type, title, lat, lng, radius_km"
}
```

```json
{
  "error": "Type inválido. Debe ser uno de: zone, airbnb, coworking, instagramable"
}
```

```json
{
  "error": "radius_km inválido. Debe ser uno de: 0.5, 1, 2"
}
```

```json
{
  "error": "safety_level inválido. Debe ser uno de: seguro, medio, regular, precaucion, inseguro"
}
```

### 500 Internal Server Error

```json
{
  "error": "Database error message"
}
```

## Notas Importantes

1. **Círculos vs Polígonos**: Todos los lugares creados vía este API se guardan como **círculos** (no polígonos)
2. **Identificación**: Todos los registros se marcan con `type: "external"` para identificar que vinieron de fuentes externas
3. **Radio**: El radio se convierte automáticamente de kilómetros a metros para almacenamiento (0.5km = 500m, 1km = 1000m, 2km = 2000m)
4. **Zonas**: Para `type=zone`, el campo `safety_level` es **REQUERIDO**
5. **Colores**: Los colores se obtienen automáticamente desde las tablas `insecurity_level` y `color_insecurity` en Supabase
6. **Normalización**: El sistema usa tablas de catálogo (`insecurity_level`, `color_insecurity`) para evitar hardcodear colores
7. **Country Code**: Debe ser un código ISO 3166-1 alpha-2 válido (ej: AR, MX, BR, CO, CL, etc.)

## Arquitectura de Datos

### Tablas de Catálogo

**color_insecurity**
- `id`: integer (PK)
- `name`: text (green, blue, orange, yellow, red)
- `hex_code`: text (#00C853, #2196F3, etc.)

**insecurity_level**
- `id`: integer (PK) - 0 a 4
- `name`: text (seguro, medio, regular, precaucion, inseguro)
- `color_id`: integer (FK a color_insecurity)

**geoplaces** (zonas)
- `insecurity_level_id`: integer (FK a insecurity_level)
- `color`: text (hex code - se sincroniza automáticamente)

Esta arquitectura permite:
- ✅ Cambiar colores desde la BD sin tocar código
- ✅ Agregar nuevos niveles de seguridad fácilmente
- ✅ Mantener consistencia en toda la aplicación
- ✅ Evitar hardcodear valores en múltiples lugares

## Consultar Documentación del API

**GET** `https://mappertrip.vercel.app/api/apibot`

Retorna la documentación completa del API en formato JSON.
