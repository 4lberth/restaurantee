// src/app/mozo/layout.jsx
import MozoSidebar from '@/components/MozoSidebar';
import '@/app/globals.css';

export const metadata = { title: 'Mozo | Restaurante' };

export default function MozoLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <MozoSidebar />
      {/* Contenido principal */}
      <main className="ml-64 flex-1 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {children}
      </main>
    </div>
  );
}