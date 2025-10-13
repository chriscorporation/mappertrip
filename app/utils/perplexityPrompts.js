export const PERPLEXITY_PROMPTS = {
  notes: (address, country, lat, lng) =>
    `Busca información confiable y reciente de la zona ${address ? `de "${address}, ${country}"` : `ubicada en las coordenadas (${lat}, ${lng}) en ${country}`}. Analiza opiniones de la policía, en sitios del gobierno oficiales, viajeros de latinoamerica, turistas, locales que vivan por la zona y extranjeros. Si es una zona remota, donde no hay nada, unicamente haz comentarios que no es una zona turistica o algo similar. Evalúa si esta zona es viable para rentar como turista extranjero: ¿se recomienda o hay que tener precaución? Compara diferentes perspectivas y resume en máximo 60 palabras. Usa formato Markdown para resaltar palabras importantes con negritas. Sin incluir referencias, números entre corchetes ni links.`,

  rent: (address, country, lat, lng) =>
    `Si es una zona remota, donde no hay nada, unicamente haz comentarios que no es una zona turistica o algo similar, no es apta para rentar, pero si no, Busca opiniones recientes (últimos 6 meses) sobre costos de renta ${address ? `en "${address}, ${country}"` : `en la zona ubicada en las coordenadas (${lat}, ${lng}) en ${country}`}. Primero identifica el nombre del barrio o zona basándote en las coordenadas si no se proporcionó el nombre. Consulta perspectivas de locales, extranjeros que se mudaron recientemente, corredores de rentas e inmobiliarias famosas en el país. Proporciona ÚNICAMENTE el costo promedio mensual en USD para un monoambiente o departamento pequeño (máximo 2 personas). Responde solo con el número promedio, sin rangos.`,

  tourism: (address, country, lat, lng) =>
    `Busca información de agencias de viajes, locales, turistas, extranjeros, sitios oficiales del gobierno y policía sobre ${address ? `"${address}, ${country}"` : `la zona ubicada en las coordenadas (${lat}, ${lng}) en ${country}`}. Si es una zona rural, o alejada, solo comentalo. Resume en formato Markdown con máximo 60 palabras. Usa negritas para resaltar palabras importantes. Sin incluir referencias, números entre corchetes ni links.`,

  secure: (address, country, lat, lng) =>
    `Busca información reciente sobre seguridad ${address ? `en "${address}, ${country}"` : `en la zona ubicada en las coordenadas (${lat}, ${lng}) en ${country}`}. Analiza opiniones de locales, extranjeros residentes, policía, paginas oficiales del gobierno y viajeros frecuentes. Responde ÚNICAMENTE con una de estas frases exactas: "Seguridad buena", "Seguridad aceptable", "Seguridad media", "Seguridad baja", o "Sin seguridad". Si es solo una region remota y no es turistica, responde "Seguridad aceptable".`,

  places: (address, country, lat, lng) =>
    `Busca opiniones, comentarios y recomendaciones de youtubers del país, turistas, extranjeros y sobre todo gente local, de lugares representativos que existan ${address ? `en "${address}, ${country}"` : `en la zona ubicada en las coordenadas (${lat}, ${lng}) en ${country}`} o cercanos para visitar. Si es una zona remota, alejada, solo comentalo, de lo contrario menciona atracciones principales, sugiere restaurantes populares, mercados de fin de semana, o eventos importantes que ocurran en la zona. Recomienda al menos 3 a 5 lugares con sus nombres específicos. IMPORTANTE: Usa formato Markdown para poner en negritas **todos los nombres de lugares de interés, atracciones, restaurantes, mercados o eventos**. No debe superar los 200 palabras la respuesta. Sin incluir referencias, números entre corchetes ni links.`,

  orientation: (address, country, lat, lng) =>
    `Analiza la ubicación geográfica ${address ? `de "${address}, ${country}"` : `en las coordenadas (${lat}, ${lng}) en ${country}`}. Determina en qué orientación cardinal o intercardinal se encuentra respecto al centro de la ciudad principal de ${country}. Responde ÚNICAMENTE con una de estas opciones exactas: "Norte", "Sur", "Este", "Oeste", "Noreste", "Noroeste", "Sureste", "Suroeste", o "Centro".`
};

export const PERPLEXITY_RESPONSE_SCHEMAS = {
  secure: {
    type: 'json_schema',
    json_schema: {
      schema: {
        type: 'object',
        properties: {
          seguridad: {
            type: 'string',
            enum: ["Seguridad buena", "Seguridad aceptable", "Seguridad media", "Seguridad baja", "Sin seguridad"]
          }
        },
        required: ["seguridad"]
      }
    }
  },
  rent: {
    type: 'json_schema',
    json_schema: {
      schema: {
        type: 'object',
        properties: {
          rent: {
            type: 'number'
          }
        },
        required: ["rent"]
      }
    }
  },
  orientation: {
    type: 'json_schema',
    json_schema: {
      schema: {
        type: 'object',
        properties: {
          orientacion: {
            type: 'string',
            enum: ["Norte", "Sur", "Este", "Oeste", "Noreste", "Noroeste", "Sureste", "Suroeste", "Centro"]
          }
        },
        required: ["orientacion"]
      }
    }
  }
};
