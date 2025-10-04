'use client';

import { useRouter } from 'next/navigation';

export default function Sidebar({ selectedTab, selectedCountry, isZonesEnabled }) {
  const router = useRouter();

  const tabs = [
    {
      id: 'countries',
      label: 'Países',
      icon: (
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'zones',
      label: 'Zonas',
      disabled: !isZonesEnabled,
      icon: (
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      id: 'airbnb',
      label: 'Hospedaje',
      disabled: !isZonesEnabled,
      icon: (
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'coworking',
      label: 'Coworking',
      disabled: !isZonesEnabled,
      icon: (
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'instagramable',
      label: 'Destacados',
      disabled: !isZonesEnabled,
      icon: (
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  const handleTabClick = (tabId) => {
    router.push(`/?tab=${tabId}`);
  };

  return (
    <>
      {/* Mobile: Bottom Navigation Bar - Sticky */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <nav className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          {tabs.map(tab => {
            const isSelected = selectedTab === tab.id;
            const isDisabled = tab.disabled;

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && handleTabClick(tab.id)}
                disabled={isDisabled}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[64px]
                  transition-all duration-200 active:scale-95
                  ${isSelected
                    ? 'text-blue-600'
                    : isDisabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                aria-label={tab.label}
              >
                <div className={`
                  transition-transform duration-200
                  ${isSelected ? 'scale-110' : ''}
                `}>
                  {tab.icon}
                </div>
                <span className={`
                  text-[10px] font-medium transition-all duration-200
                  ${isSelected ? 'font-semibold' : ''}
                `}>
                  {tab.label}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Desktop: Vertical Sidebar */}
      <div className="hidden lg:flex w-24 bg-white border-r border-gray-200 flex-col">
        {tabs.map(tab => {
          const isSelected = selectedTab === tab.id;
          const isDisabled = tab.disabled;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && handleTabClick(tab.id)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center justify-center py-6 px-2 border-b border-gray-100
                transition-all duration-200 group
                ${isSelected
                  ? 'bg-blue-50 text-blue-600'
                  : isDisabled
                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer'
                }
              `}
              aria-label={tab.label}
            >
              {/* Indicador de selección lateral */}
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-r-full" />
              )}

              <div className={`
                mb-2 transition-transform duration-200
                ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
              `}>
                {tab.icon}
              </div>

              <span className={`
                text-xs font-medium text-center leading-tight
                ${isSelected ? 'font-semibold' : ''}
              `}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
