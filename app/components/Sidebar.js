'use client';

import { BiWorld, BiMapPin, BiHome } from 'react-icons/bi';

export default function Sidebar({ selectedTab, onTabChange, selectedCountry, isZonesEnabled }) {
  const tabs = [
    { id: 'countries', label: 'Countries', Icon: BiWorld },
    { id: 'zones', label: 'Zones', Icon: BiMapPin, disabled: !isZonesEnabled },
    { id: 'airbnb', label: 'AirBnB', Icon: BiHome }
  ];

  return (
    <div className="w-[100px] bg-gray-100 border-r border-gray-300 flex flex-col">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={`
            flex flex-col items-center justify-center py-6 px-2 border-b border-gray-200
            transition-colors
            ${selectedTab === tab.id
              ? 'bg-white border-l-4 border-l-blue-600'
              : tab.disabled
                ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                : 'hover:bg-gray-200 cursor-pointer'
            }
          `}
        >
          <tab.Icon className="text-2xl mb-1" />
          <span className={`text-xs font-medium text-center ${tab.disabled ? 'text-gray-300' : ''}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
