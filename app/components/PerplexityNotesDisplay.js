import ReactMarkdown from 'react-markdown';
import { BiDollar, BiShield, BiMapAlt, BiInfoCircle, BiMap } from 'react-icons/bi';

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
        icon: '🛡️'
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
        icon: '🔷'
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
        icon: '⚠️'
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
        icon: '⚡'
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
        icon: '🚨'
      };
    }
  };

  const securityConfig = perplexityData.secure ? getSecurityConfig(perplexityData.secure) : null;

  return (
    <div className="space-y-6">
      {/* Security Evaluation - Estilo de la imagen */}
      {perplexityData.secure && securityConfig && (
        <div role="article" aria-labelledby="security-heading" className={`relative overflow-hidden rounded-3xl border-2 ${securityConfig.borderColor} ${securityConfig.bgColor} p-8 shadow-lg`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`${securityConfig.iconBg} rounded-2xl p-3 shadow-md`}>
              <BiShield className={`text-3xl ${securityConfig.iconColor}`} aria-hidden="true" />
            </div>
            <h3 id="security-heading" className="font-bold text-xl text-gray-800 uppercase tracking-wide">
              EVALUACIÓN DE SEGURIDAD
            </h3>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${securityConfig.barColor} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-4`}
                style={{ width: `${securityConfig.percentage}%` }}
              >
                <span className="text-white font-bold text-xl drop-shadow-md">{securityConfig.percentage}%</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm font-semibold text-gray-600">
              <span>Riesgo Alto</span>
              <span>Seguridad Óptima</span>
            </div>
          </div>

          {/* Nivel de seguridad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{securityConfig.icon}</span>
              <div>
                <p className="text-sm text-gray-600 font-medium">Nivel de Seguridad</p>
                <p className={`text-2xl font-bold ${securityConfig.textColor}`}>
                  {securityConfig.label}
                </p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-2xl border-2 ${securityConfig.badgeBg} shadow-sm`}>
              <p className={`text-base font-bold ${securityConfig.textColor}`}>
                {perplexityData.secure}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nivel de Seguridad - Card compacta */}
      {perplexityData.secure && securityConfig && (
        <div role="article" className={`relative overflow-hidden rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg`}>
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <BiShield className="text-4xl text-blue-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-800 mb-2">Nivel de Seguridad</h3>
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 ${securityConfig.badgeBg} shadow-sm`}>
                <span className="text-xl">{securityConfig.icon}</span>
                <span className={`text-base font-bold ${securityConfig.textColor}`}>
                  {perplexityData.secure}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent */}
      {perplexityData.rent && (
        <div role="article" aria-labelledby="rent-heading" className="relative overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <BiDollar className="text-4xl text-emerald-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 id="rent-heading" className="font-bold text-lg text-gray-800 mb-2">Costo de renta promedio</h3>
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 bg-emerald-100 border-emerald-300 shadow-sm">
                <span className="text-2xl font-bold text-emerald-800">
                  ${Math.round(perplexityData.rent)} USD/mes
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">Monoambiente (máx. 2 personas)</p>
            </div>
          </div>
        </div>
      )}

      {/* Tourism */}
      {perplexityData.tourism && (
        <div role="article" aria-labelledby="tourism-heading" className="relative overflow-hidden rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <BiMapAlt className="text-4xl text-purple-600" aria-hidden="true" />
            </div>
            <h3 id="tourism-heading" className="font-bold text-lg text-gray-800">Información Turística</h3>
          </div>
          <div
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            title="Información turística de la zona"
          >
            <ReactMarkdown>{perplexityData.tourism}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Notes */}
      {perplexityData.notes && (
        <div role="article" aria-labelledby="notes-heading" className="relative overflow-hidden rounded-3xl border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <BiInfoCircle className="text-4xl text-gray-600" aria-hidden="true" />
            </div>
            <h3 id="notes-heading" className="font-bold text-lg text-gray-800">Notas Generales</h3>
          </div>
          <div
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            title="Notas generales sobre la zona"
          >
            <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Places */}
      {perplexityData.places && (
        <div role="article" aria-labelledby="places-heading" className="relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-md">
              <BiMap className="text-4xl text-indigo-600" aria-hidden="true" />
            </div>
            <h3 id="places-heading" className="font-bold text-lg text-gray-800">Lugares de Interés</h3>
          </div>
          <div
            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
            title="Lugares de interés en la zona"
          >
            <ReactMarkdown>{perplexityData.places}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
