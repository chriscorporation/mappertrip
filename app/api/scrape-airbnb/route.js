import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  let browser = null;

  try {
    const { url, country_code, original_url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extraer id_room de la URL
    const idRoomMatch = url.match(/\/rooms\/(\d+)/);
    const idRoom = idRoomMatch ? idRoomMatch[1] : null;

    if (!idRoom) {
      return NextResponse.json({ error: 'URL inválida, no se encontró id de room' }, { status: 400 });
    }

    // Limpiar URL base (sin parámetros) para verificar si existe
    const baseUrl = url.split('?')[0];

    // Modificar la URL con las nuevas fechas, currency y locale
    const urlObj = new URL(url);

    // Formatear fechas como YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Intentar extraer fechas de la URL original
    let checkInFromUrl = urlObj.searchParams.get('check_in');
    let checkOutFromUrl = urlObj.searchParams.get('check_out');

    let baseCheckInDate, baseCheckOutDate;

    if (checkInFromUrl && checkOutFromUrl) {
      // Usar las fechas de la URL original como base
      baseCheckInDate = new Date(checkInFromUrl);
      baseCheckOutDate = new Date(checkOutFromUrl);
    } else {
      // Calcular fechas: check-in 7 días después de hoy, rango de 15 días
      const today = new Date();
      baseCheckInDate = new Date(today);
      baseCheckInDate.setDate(today.getDate() + 7);

      baseCheckOutDate = new Date(baseCheckInDate);
      baseCheckOutDate.setDate(baseCheckInDate.getDate() + 15);
    }

    const checkInStr = formatDate(baseCheckInDate);
    const checkOutStr = formatDate(baseCheckOutDate);

    // Cambiar el dominio a es.airbnb.com
    urlObj.hostname = 'es.airbnb.com';

    // Generar UUID random para source_impression_id
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    // Mantener todos los parámetros originales y actualizar solo las fechas
    const cleanParams = new URLSearchParams(urlObj.search);
    cleanParams.set('check_in', checkInStr);
    cleanParams.set('check_out', checkOutStr);
    cleanParams.set('currency', 'MXN');
    cleanParams.set('locale', 'es');
    cleanParams.set('adults', '1');
    cleanParams.set('source_impression_id', generateUUID());

    // Reconstruir URL limpia
    urlObj.search = cleanParams.toString();
    const modifiedUrl = urlObj.toString();

    console.log('URL modificada:', modifiedUrl);

    // Función para intentar scraping con diferentes fechas
    const tryScrapingWithDates = async (checkIn, checkOut, attempt = 1) => {
      const urlForAttempt = new URL(baseUrl);
      urlForAttempt.hostname = 'es.airbnb.com';

      const params = new URLSearchParams();
      params.set('check_in', checkIn);
      params.set('check_out', checkOut);
      params.set('currency', 'MXN');
      params.set('locale', 'es');
      params.set('adults', '1');
      params.set('source_impression_id', generateUUID());

      urlForAttempt.search = params.toString();
      const attemptUrl = urlForAttempt.toString();

      console.log(`Intento ${attempt} con URL:`, attemptUrl);

      return attemptUrl;
    };

    // Usar Puppeteer para cargar la página y esperar que se cargue el JavaScript
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });

    const page = await browser.newPage();

    // User agents aleatorios
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15'
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

    // Configurar user agent aleatorio
    await page.setUserAgent(randomUserAgent);

    // Configurar viewport aleatorio
    await page.setViewport({
      width: 1920 + Math.floor(Math.random() * 100),
      height: 1080 + Math.floor(Math.random() * 100)
    });

    // Configurar headers adicionales
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    });

    // Ocultar que es Puppeteer/automatización
    await page.evaluateOnNewDocument(() => {
      // Sobrescribir navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Sobrescribir el plugin array
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Sobrescribir navigator.languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['es-MX', 'es', 'en'],
      });

      // Chrome runtime
      window.chrome = {
        runtime: {},
      };

      // Permisos
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
    });

    // Navegar a la URL con estrategia más permisiva
    await page.goto(modifiedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Función para cerrar modal y extraer precio
    const extractPrice = async (waitTime = 0) => {
      if (waitTime > 0) {
        await page.evaluate((time) => new Promise(resolve => setTimeout(resolve, time)), waitTime);
      }

      // Intentar cerrar modal de traducción
      try {
        const closeButton = await page.$('button[aria-label="Cerrar"]');
        if (closeButton) {
          await closeButton.click();
          console.log('Modal de traducción cerrado');
        }
      } catch (e) {}

      // Hacer scroll
      await page.evaluate(() => window.scrollBy(0, 1000));

      // Extraer precio del DOM
      return await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          const text = script.textContent || '';
          const priceMatch = text.match(/"price":\s*{\s*"amount":\s*(\d+)/);
          if (priceMatch) return `$${priceMatch[1]} MXN`;
          const priceMatch2 = text.match(/"localizedPrice":\s*"([^"]+)"/);
          if (priceMatch2) return priceMatch2[1];
        }

        const priceSpans = Array.from(document.querySelectorAll('span, div'));
        for (const el of priceSpans) {
          const text = el.textContent?.trim() || '';
          const match1 = text.match(/\$\s*[\d,]+\s*MXN/);
          if (match1 && text.length < 50) return match1[0];
          const match2 = text.match(/MXN\s*\$?\s*[\d,]+/);
          if (match2 && text.length < 50) return match2[0];
        }
        return null;
      });
    };

    // Primer intento: esperar 2 segundos para que cargue el precio
    let priceFromDOM = await extractPrice(2000);
    console.log('Precio extraído (intento 1):', priceFromDOM);

    // Obtener el HTML completo después de que JavaScript se haya ejecutado
    const html = await page.content();

    // Guardar fragmento del HTML para debug
    console.log('URL modificada:', modifiedUrl);
    console.log('HTML length:', html.length);

    // Buscar todas las ocurrencias de $ en el HTML
    const dollarMatches = html.match(/\$[\d,]+/g);
    console.log('Precios encontrados con $:', dollarMatches?.slice(0, 10));

    // Función auxiliar para extraer datos con múltiples patrones
    const extractData = (patterns) => {
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) {
          console.log('Patrón encontrado:', pattern, '-> Resultado:', match[1]);
          return match[1];
        }
      }
      return null;
    };

    // Extraer coordenadas
    let lat = null;
    let lng = null;

    const coordPatterns = [
      { pattern: /"latitude["\s]*:["\s]*(-?\d+\.?\d*).*?"longitude["\s]*:["\s]*(-?\d+\.?\d*)/, latIndex: 1, lngIndex: 2 },
      { pattern: /"lat["\s]*:["\s]*(-?\d+\.?\d*).*?"lng["\s]*:["\s]*(-?\d+\.?\d*)/, latIndex: 1, lngIndex: 2 },
      { pattern: /"coordinates["\s]*:["\s]*\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/, latIndex: 2, lngIndex: 1 } // GeoJSON: [lng, lat]
    ];

    for (const { pattern, latIndex, lngIndex } of coordPatterns) {
      const match = html.match(pattern);
      if (match) {
        lat = parseFloat(match[latIndex]);
        lng = parseFloat(match[lngIndex]);
        if (lat && lng) break;
      }
    }

    // Extraer título
    const title = extractData([
      /<title[^>]*>([^<]+)<\/title>/i,
      /"pdpTitleString["\s]*:["\s]*"([^"]+)"/,
      /"publicName["\s]*:["\s]*"([^"]+)"/,
      /"name["\s]*:["\s]*"([^"]+)"/,
      /"title["\s]*:["\s]*"([^"]+)"/,
      /<meta\s+property="og:title"\s+content="([^"]+)"/i
    ]);

    // Extraer precio - Primero intentar del DOM, luego del HTML
    let price = priceFromDOM; // Usar el precio extraído directamente del DOM

    if (!price) {
      // Intentar patrones específicos de Airbnb en el HTML
      const pricePatterns = [
        /"structuredDisplayPrice["\s]*:[^{]*"primaryLine["\s]*:[^{]*"price["\s]*:["\s]*"([^"]+)"/,
        /"displayPrice["\s]*:["\s]*"([^"]+)"/,
        /"localizedPrice["\s]*:["\s]*"([^"]+)"/,
        /"formattedPrice["\s]*:["\s]*"([^"]+)"/,
        /"averagePrice["\s]*:["\s]*"([^"]+)"/,
        /"priceString["\s]*:["\s]*"([^"]+)"/,
        /"qualifiedPrice["\s]*:["\s]*"([^"]+)"/,
      ];

      price = extractData(pricePatterns);
    }

    if (!price) {
      // Buscar $X,XXX MXN en cualquier parte
      const priceMatch = html.match(/\$[\d,]+\s*MXN/);
      if (priceMatch) {
        price = priceMatch[0];
      }
    }

    // Extraer ranking
    const rankingStr = extractData([
      /"starRating["\s]*:["\s]*(\d+\.?\d*)/,
      /"rating["\s]*:["\s]*(\d+\.?\d*)/,
      /★\s*(\d+\.?\d*)/
    ]);
    const ranking = rankingStr ? parseFloat(rankingStr) : null;

    // Extraer evaluaciones
    const evaluationsStr = extractData([
      /"reviewsCount["\s]*:["\s]*(\d+)/,
      /\((\d+)\s*evaluaci[oó]n/i,
      /"numberOfReviews["\s]*:["\s]*(\d+)/
    ]);
    const evaluations = evaluationsStr ? parseInt(evaluationsStr) : null;

    // Extraer descripción
    const description = extractData([
      /"pdpSummaryDescription["\s]*:["\s]*"([^"]+)"/,
      /"description["\s]*:["\s]*"([^"]+)"/,
      /<meta\s+name="description"\s+content="([^"]+)"/i,
      /<meta\s+property="og:description"\s+content="([^"]+)"/i,
      /"sectionedDescription["\s]*:["\s]*{[^}]*"text["\s]*:["\s]*"([^"]+)"/,
      /"summary["\s]*:["\s]*"([^"]+)"/
    ]);

    // Extraer detalles (huéspedes, habitaciones, etc)
    const details = extractData([
      /"subtitle["\s]*:["\s]*"([^"]+)"/,
      /"pdpDetailsSubtitle["\s]*:["\s]*"([^"]+)"/,
      /(\d+\s*huésped[^·]*·[^"<]+)/i,
      /"listingExpectations["\s]*:["\s]*"([^"]+)"/
    ]);

    // Segundo intento: +15 días con espera de 2 segundos
    if (!price) {
      console.log('Precio no encontrado, intentando con +15 días...');

      const attempt2CheckIn = new Date(baseCheckInDate);
      attempt2CheckIn.setDate(baseCheckInDate.getDate() + 15);

      const attempt2CheckOut = new Date(attempt2CheckIn);
      attempt2CheckOut.setDate(attempt2CheckIn.getDate() + 15);

      const attempt2Url = await tryScrapingWithDates(formatDate(attempt2CheckIn), formatDate(attempt2CheckOut), 2);

      await page.goto(attempt2Url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      price = await extractPrice(2000); // 2 segundos de espera
      console.log('Precio extraído (intento 2):', price);
    }

    // Tercer intento: +2 meses con espera de 2 segundos
    if (!price) {
      console.log('Precio no encontrado, intentando con +2 meses...');

      const attempt3CheckIn = new Date(baseCheckInDate);
      attempt3CheckIn.setMonth(baseCheckInDate.getMonth() + 2);

      const attempt3CheckOut = new Date(attempt3CheckIn);
      attempt3CheckOut.setDate(attempt3CheckIn.getDate() + 15);

      const attempt3Url = await tryScrapingWithDates(formatDate(attempt3CheckIn), formatDate(attempt3CheckOut), 3);

      await page.goto(attempt3Url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      price = await extractPrice(2000); // 2 segundos de espera
      console.log('Precio extraído (intento 3):', price);

      if (!price) {
        console.log('Precio no encontrado después de 3 intentos');
      }
    }

    // Verificar si ya existe en la base de datos por id_room
    const { data: existing } = await supabase
      .from('airbnb')
      .select('*')
      .eq('id_room', idRoom)
      .single();

    // Log de debug
    console.log('Datos extraídos:', {
      id_room: idRoom,
      title: title?.substring(0, 50),
      price,
      ranking,
      evaluations,
      lat,
      lng
    });

    // Detectar errores
    const errors = [];
    if (!lat || !lng) errors.push('No se encontraron coordenadas');
    if (!price) errors.push('No se encontró el precio');
    if (!title) errors.push('No se encontró el título');

    const dataToSave = {
      id_room: idRoom,
      url: baseUrl,
      original_url: original_url || url,
      title: title || null,
      details: details || null,
      price: price || null,
      description: description || null,
      ranking: ranking || null,
      evaluations: evaluations || null,
      lat: lat || null,
      lng: lng || null,
      country_code: country_code || 'AR',
      error: errors.length > 0 ? errors.join(', ') : null,
      html_fallback: errors.length > 0 ? html : null // Guardar todo el HTML si hay errores
    };

    if (existing) {
      // Actualizar registro existente
      await supabase
        .from('airbnb')
        .update(dataToSave)
        .eq('id_room', idRoom);
    } else {
      // Insertar nuevo registro
      await supabase
        .from('airbnb')
        .insert([dataToSave]);
    }

    return NextResponse.json({
      lat,
      lng,
      saved: true,
      updated: existing ? existing.price !== price : false
    });

  } catch (error) {
    console.error('Error scraping:', error);

    // Guardar error en la base de datos si tenemos la URL
    if (request.body?.url) {
      await supabase
        .from('airbnb')
        .upsert([{
          url: request.body.url.split('?')[0],
          error: error.message
        }]);
    }

    return NextResponse.json({
      error: 'Error al obtener datos de Airbnb: ' + error.message
    }, { status: 500 });
  } finally {
    // Cerrar el navegador
    if (browser) {
      await browser.close();
    }
  }
}
