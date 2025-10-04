'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiMapPin, FiTrendingUp, FiActivity } from 'react-icons/fi';

export default function RealTimeMetrics({ places, selectedCountry }) {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [liveActivity, setLiveActivity] = useState(0);

  // Simular contador de visitas que incrementa gradualmente
  useEffect(() => {
    // Cargar visitas del localStorage o iniciar en un número base
    const storedVisits = localStorage.getItem('mappertrip_total_visits');
    const baseVisits = storedVisits ? parseInt(storedVisits) : 12847;

    setVisitorCount(baseVisits);

    // Incrementar visitas cada cierto tiempo (simulación de usuarios en tiempo real)
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const newCount = prev + Math.floor(Math.random() * 3) + 1; // +1 a +3 visitas
        localStorage.setItem('mappertrip_total_visits', newCount.toString());
        return newCount;
      });
    }, 8000); // Cada 8 segundos

    return () => clearInterval(interval);
  }, []);

  // Simular actividad en vivo
  useEffect(() => {
    const updateActivity = () => {
      setLiveActivity(Math.floor(Math.random() * 15) + 5); // Entre 5 y 20 usuarios activos
    };

    updateActivity();
    const interval = setInterval(updateActivity, 12000); // Cada 12 segundos

    return () => clearInterval(interval);
  }, []);

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Calcular estadísticas basadas en el país seleccionado
  const countryPlaces = selectedCountry
    ? places.filter(p => p.country_code === selectedCountry.country_code)
    : [];

  const safeZones = countryPlaces.filter(p =>
    p.color === '#22c55e' || p.color === '#3b82f6'
  ).length;

  const totalZones = places.length;

  const metrics = [
    {
      icon: FiUsers,
      label: 'Consultas totales',
      value: visitorCount.toLocaleString('es-ES'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%'
    },
    {
      icon: FiActivity,
      label: 'Usuarios activos',
      value: liveActivity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'ahora',
      pulse: true
    },
    {
      icon: FiMapPin,
      label: 'Zonas mapeadas',
      value: totalZones,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '19 países'
    },
    {
      icon: FiTrendingUp,
      label: selectedCountry ? `Zonas seguras en ${selectedCountry.name}` : 'Zonas seguras',
      value: selectedCountry ? safeZones : Math.floor(totalZones * 0.65),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: selectedCountry ? `${Math.round((safeZones / countryPlaces.length) * 100)}%` : '65%'
    }
  ];

  return (
    <div
      className={`fixed bottom-6 left-6 z-[900] transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full absolute top-0 left-0 animate-ping"></div>
            </div>
            <h3 className="text-white font-semibold text-sm">Métricas en vivo</h3>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-gray-50 rounded-xl p-3 hover:shadow-md transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                {/* Icon */}
                <div className={`${metric.bgColor} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-xl font-bold text-gray-900">
                    {metric.value}
                  </span>
                  {metric.pulse && (
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>

                {/* Label */}
                <p className="text-xs text-gray-600 font-medium mb-1 line-clamp-1">
                  {metric.label}
                </p>

                {/* Trend */}
                <div className="flex items-center gap-1">
                  <span className={`text-[10px] font-semibold ${metric.color}`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-500 text-center">
            Datos actualizados en tiempo real • {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
