'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

// SVG Icon component for Countries
const CountriesIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/world-2-svgrepo-com.svg"
      alt="Countries"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for Zones
const ZonesIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/arrow-down-right-square-svgrepo-com.svg"
      alt="Zones"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for Airbnb
const AirbnbIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/home-alt-svgrepo-com.svg"
      alt="Airbnb"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for CoWorking
const CoworkingIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/people-nearby-svgrepo-com.svg"
      alt="CoWorking"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

// SVG Icon component for Instagramable
const InstagramableIcon = ({ className }) => (
  <div className={className} style={{ width: '24px', height: '24px', position: 'relative' }}>
    <Image
      src="/icons/camera-svgrepo-com.svg"
      alt="Instagramable"
      width={24}
      height={24}
      style={{ objectFit: 'contain' }}
    />
  </div>
);

export default function Sidebar({ selectedTab, selectedCountry, isZonesEnabled }) {
  const router = useRouter();

  const tabs = [
    { id: 'countries', label: 'Countries', Icon: CountriesIcon },
    { id: 'zones', label: 'Zones', Icon: ZonesIcon, disabled: !isZonesEnabled },
    { id: 'airbnb', label: 'AirBnB', Icon: AirbnbIcon, disabled: !isZonesEnabled },
    { id: 'coworking', label: 'CoWorking', Icon: CoworkingIcon, disabled: !isZonesEnabled },
    { id: 'instagramable', label: 'Instagramable', Icon: InstagramableIcon, disabled: !isZonesEnabled }
  ];

  const handleTabClick = (tabId) => {
    router.push(`/?tab=${tabId}`);
  };

  return (
    <div className="w-[100px] bg-gray-100 border-r border-gray-300 flex flex-col">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && handleTabClick(tab.id)}
          disabled={tab.disabled}
          className={`
            flex flex-col items-center justify-center py-6 px-2 border-b border-gray-200
            transition-colors
            ${selectedTab === tab.id
              ? 'bg-white border-l-4 border-l-blue-600'
              : tab.disabled
                ? 'bg-gray-50 text-gray-300'
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
