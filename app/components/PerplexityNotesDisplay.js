import ReactMarkdown from 'react-markdown';
import { BiDollar, BiShield, BiMapAlt, BiInfoCircle, BiMap, BiShieldAlt2, BiError, BiErrorCircle, BiXCircle } from 'react-icons/bi';

export default function PerplexityNotesDisplay({ perplexityData }) {
  if (!perplexityData) {
    return (
      <p className="text-gray-500 font-bold text-sm">
        No hay información detallada disponible.
      </p>
    );
  }

  // Función para obtener colores y configuración según nivel de seguridad
  const getSecurityConfig = (secureText) => {
    const text = secureText?.toLowerCase() || '';

    if (text.includes('buena')) {
      return {
        percentage: 90,
        label: 'Alta',
        bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        iconBg: 'bg-white',
        iconColor: 'text-green-600',
        barColor: 'from-green-400 to-emerald-500',
        textColor: 'text-green-800',
        badgeBg: 'bg-green-100 border-green-300',
        Icon: BiShield
      };
    } else if (text.includes('aceptable')) {
      return {
        percentage: 70,
        label: 'Media-Alta',
        bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        borderColor: 'border-blue-200',
        iconBg: 'bg-white',
        iconColor: 'text-blue-600',
        barColor: 'from-blue-400 to-cyan-500',
        textColor: 'text-blue-800',
        badgeBg: 'bg-blue-100 border-blue-300',
        Icon: BiShieldAlt2
      };
    } else if (text.includes('media')) {
      return {
        percentage: 50,
        label: 'Media',
        bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
        borderColor: 'border-orange-200',
        iconBg: 'bg-white',
        iconColor: 'text-orange-600',
        barColor: 'from-orange-400 to-amber-500',
        textColor: 'text-orange-800',
        badgeBg: 'bg-orange-100 border-orange-300',
        Icon: BiError
      };
    } else if (text.includes('baja')) {
      return {
        percentage: 30,
        label: 'Precaución',
        bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-200',
        iconBg: 'bg-white',
        iconColor: 'text-yellow-600',
        barColor: 'from-yellow-400 to-amber-400',
        textColor: 'text-yellow-800',
        badgeBg: 'bg-yellow-100 border-yellow-300',
        Icon: BiErrorCircle
      };
    } else {
      return {
        percentage: 15,
        label: 'Baja',
        bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
        borderColor: 'border-red-200',
        iconBg: 'bg-white',
        iconColor: 'text-red-600',
        barColor: 'from-red-400 to-rose-500',
        textColor: 'text-red-800',
        badgeBg: 'bg-red-100 border-red-300',
        Icon: BiXCircle
      };
    }
  };

  const securityConfig = perplexityData.secure ? getSecurityConfig(perplexityData.secure) : null;

  return (
    <div className="space-y-4">
      {/* Layout de 2 columnas: Izquierda (Rent + Security) y Derecha (Tourism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Columna Izquierda: Rent y Security apilados */}
        <div className="flex flex-col gap-4">
          {/* Rent */}
          {perplexityData.rent && (
            <div role="article" aria-labelledby="rent-heading" className="relative overflow-hidden rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl p-2 shadow-sm">
                  <BiDollar className="text-2xl text-gray-600" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 id="rent-heading" className="font-bold text-sm text-gray-800 mb-1">Costo de renta promedio</h3>
                  <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border bg-gray-200 border-gray-400 shadow-sm">
                    <span className="text-base font-bold text-gray-800">
                      ${Math.round(perplexityData.rent)} USD/mes
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Monoambiente (máx. 2 personas)</p>
                </div>
              </div>
            </div>
          )}

          {/* Security Evaluation */}
          {perplexityData.secure && securityConfig && (
            <div role="article" aria-labelledby="security-heading" className={`relative overflow-hidden rounded-2xl border ${securityConfig.borderColor} ${securityConfig.bgColor} p-4 shadow-md`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`${securityConfig.iconBg} rounded-xl p-2 shadow-sm`}>
                  <BiShield className={`text-xl ${securityConfig.iconColor}`} aria-hidden="true" />
                </div>
                <h3 id="security-heading" className="font-bold text-sm text-gray-800">
                  Evaluación de seguridad - {securityConfig.label}
                </h3>
              </div>

              {/* Barra de progreso */}
              <div>
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${securityConfig.barColor} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3`}
                    style={{ width: `${securityConfig.percentage}%` }}
                  >
                    <span className="text-white font-bold text-sm drop-shadow-md">{securityConfig.percentage}%</span>
                  </div>
                </div>
                <div className="flex justify-between mt-1 text-xs font-semibold text-gray-600">
                  <span>Riesgo Alto</span>
                  <span>Seguridad Óptima</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Tourism */}
        {perplexityData.tourism && (
          <div role="article" aria-labelledby="tourism-heading" className="relative overflow-hidden rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-4 shadow-md h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white rounded-xl p-2 shadow-sm">
                <BiMapAlt className="text-2xl text-gray-600" aria-hidden="true" />
              </div>
              <h3 id="tourism-heading" className="font-bold text-sm text-gray-800">Información Turística</h3>
            </div>
            <div
              className="text-xs text-gray-700 leading-relaxed prose prose-xs max-w-none"
              title="Información turística de la zona"
            >
              <ReactMarkdown>{perplexityData.tourism}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {perplexityData.notes && (
        <div role="article" aria-labelledby="notes-heading" className="relative overflow-hidden rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white rounded-xl p-2 shadow-sm">
              <BiInfoCircle className="text-2xl text-gray-600" aria-hidden="true" />
            </div>
            <h3 id="notes-heading" className="font-bold text-sm text-gray-800">Notas Generales</h3>
          </div>
          <div
            className="text-xs text-gray-700 leading-relaxed prose prose-xs max-w-none"
            title="Notas generales sobre la zona"
          >
            <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Places */}
      {perplexityData.places && (
        <div role="article" aria-labelledby="places-heading" className="relative overflow-hidden rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white rounded-xl p-2 shadow-sm">
              <BiMap className="text-2xl text-gray-600" aria-hidden="true" />
            </div>
            <h3 id="places-heading" className="font-bold text-sm text-gray-800">Lugares de Interés</h3>
          </div>
          <div
            className="text-xs text-gray-700 leading-relaxed prose prose-xs max-w-none"
            title="Lugares de interés en la zona"
          >
            <ReactMarkdown>{perplexityData.places}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
