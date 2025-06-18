// src/app/admin/layout.jsx
import AdminSidebar from '@/components/AdminSidebar';
import '@/app/globals.css';

export const metadata = { title: 'Admin | Restaurante' };

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar />
      {/* Contenido principal */}
      <main className="ml-64 flex-1 p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {children}
      </main>
    </div>
  );
}
