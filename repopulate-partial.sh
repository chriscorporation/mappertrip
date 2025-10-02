#!/bin/bash

# Lista de zone_ids
ZONES=(11 12 19 20 25 26 34 35 36 37 38 39 40 41)

# Lista de tipos de búsqueda (solo rent, notes, tourism)
TYPES=("rent" "notes" "tourism")

echo "Iniciando re-población parcial de datos de Perplexity..."
echo "Total zonas: ${#ZONES[@]}"
echo "Tipos: rent, notes, tourism"
echo "Total llamadas: $((${#ZONES[@]} * ${#TYPES[@]}))"
echo ""

# Ejecutar búsquedas para cada zona
for zone_id in "${ZONES[@]}"; do
  echo "Procesando zona ID: $zone_id"

  for search_type in "${TYPES[@]}"; do
    echo "  - Ejecutando búsqueda: $search_type"
    curl -s -X POST http://localhost:3000/api/perplexity-search \
      -H "Content-Type: application/json" \
      -d "{\"zone_id\": $zone_id, \"search_type\": \"$search_type\"}" &

    # Esperar 3 segundos entre llamadas
    sleep 3
  done

  # Esperar a que terminen todas las búsquedas de esta zona
  wait
  echo "  ✓ Zona $zone_id completada"
  echo ""
done

echo "✅ Re-población parcial completada"
