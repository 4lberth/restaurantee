// src/components/MozoSidebar.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const links = [
  { 
    href: '/mozo/mesas', 
    label: 'Mesas',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    )
  },
  { 
    href: '/mozo/ordenes', 
    label: 'Órdenes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  }
];

export default function MozoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 h-screen fixed flex flex-col bg-gray-900/95 backdrop-blur border-r border-gray-800 p-6">
      {/* Logo/Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">RestaurantApp</h2>
            <p className="text-orange-400 text-sm font-medium">MOZO</p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-2">
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              pathname.startsWith(href)
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-white shadow-lg'
                : 'hover:bg-gray-800/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-700'
            }`}
          >
            <div className={`${pathname.startsWith(href) ? 'text-orange-400' : 'text-gray-400 group-hover:text-orange-400'}`}>
              {icon}
            </div>
            <span className="font-medium">{label}</span>
            {pathname.startsWith(href) && (
              <div className="ml-auto w-2 h-2 bg-orange-400 rounded-full"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer con botón de logout */}
      <div className="pt-6 border-t border-gray-800">
        <LogoutButton />
      </div>
    </aside>
  );
}