// src/app/admin/layout.jsx
import AdminSidebar from '@/components/AdminSidebar';
import '@/app/globals.css';              // asegura estilos globales

export const metadata = { title:'Admin | Restaurante' };

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />
      {/* empujamos el contenido = ancho sidebar */}
      <main className="ml-56 p-8 w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {children}
      </main>
    </div>
  );
}
