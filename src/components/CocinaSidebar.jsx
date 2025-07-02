'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default function CocinaSidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-gray-800/50 backdrop-blur border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">RestaurantApp</h1>
            <p className="text-sm text-gray-400">Panel de Cocina</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/cocina"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive('/cocina')
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="font-medium">Órdenes</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">En vivo</span>
          </div>
        </Link>

        <Link
          href="/cocina/historial"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive('/cocina/historial')
              ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25'
              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Historial</span>
        </Link>

        
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="bg-gray-700/30 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Chef de Cocina</p>
              <p className="text-gray-400 text-sm">Turno actual</p>
            </div>
          </div>
        </div>
        
        <LogoutButton className="w-full px-4 py-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </LogoutButton>
      </div>
    </aside>
  );
}