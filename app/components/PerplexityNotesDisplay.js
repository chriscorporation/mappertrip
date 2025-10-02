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

  return (
    <div className="space-y-6">
      {/* Rent */}
      {perplexityData.rent && (
        <div role="article" aria-labelledby="rent-heading">
          <div className="flex items-center gap-2 mb-2">
            <BiDollar className="text-base text-gray-600 flex-shrink-0" aria-hidden="true" />
            <h3 id="rent-heading" className="font-semibold text-sm text-gray-700">Costo de renta promedio</h3>
          </div>
          <span
            className="inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
            title={`Costo promedio de renta mensual: $${Math.round(perplexityData.rent)} USD`}
            aria-label={`Costo de renta: ${Math.round(perplexityData.rent)} dólares por mes`}
          >
            ${Math.round(perplexityData.rent)} USD/mes
          </span>
          <p className="text-xs text-gray-500 mt-2">Monoambiente (máx. 2 personas)</p>
        </div>
      )}

      {/* Secure */}
      {perplexityData.secure && (
        <div role="article" aria-labelledby="security-heading">
          <div className="flex items-center gap-2 mb-2">
            <BiShield className="text-lg text-blue-600" aria-hidden="true" />
            <h3 id="security-heading" className="font-semibold text-sm text-gray-700">Seguridad</h3>
          </div>
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 ${
              perplexityData.secure.toLowerCase().includes('buena') || perplexityData.secure.toLowerCase().includes('aceptable')
                ? 'text-green-700'
                : perplexityData.secure.toLowerCase().includes('media')
                ? 'text-orange-600'
                : 'text-red-600'
            }`}
            title={`Nivel de seguridad de la zona: ${perplexityData.secure}`}
            aria-label={`Seguridad: ${perplexityData.secure}`}
          >
            {perplexityData.secure}
          </span>
        </div>
      )}

      {/* Tourism */}
      {perplexityData.tourism && (
        <div role="article" aria-labelledby="tourism-heading">
          <div className="flex items-center gap-2 mb-2">
            <BiMapAlt className="text-lg text-purple-600" aria-hidden="true" />
            <h3 id="tourism-heading" className="font-semibold text-sm text-gray-700">Turismo</h3>
          </div>
          <div
            className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
            title="Información turística de la zona"
          >
            <ReactMarkdown>{perplexityData.tourism}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Notes */}
      {perplexityData.notes && (
        <div role="article" aria-labelledby="notes-heading">
          <div className="flex items-center gap-2 mb-2">
            <BiInfoCircle className="text-lg text-gray-600" aria-hidden="true" />
            <h3 id="notes-heading" className="font-semibold text-sm text-gray-700">Notas Generales</h3>
          </div>
          <div
            className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
            title="Notas generales sobre la zona"
          >
            <ReactMarkdown>{perplexityData.notes}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Places */}
      {perplexityData.places && (
        <div role="article" aria-labelledby="places-heading">
          <div className="flex items-center gap-2 mb-2">
            <BiMap className="text-lg text-indigo-600" aria-hidden="true" />
            <h3 id="places-heading" className="font-semibold text-sm text-gray-700">Lugares de Interés</h3>
          </div>
          <div
            className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
            title="Lugares de interés en la zona"
          >
            <ReactMarkdown>{perplexityData.places}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
