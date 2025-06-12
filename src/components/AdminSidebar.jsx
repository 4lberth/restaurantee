// src/components/AdminSidebar.jsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const links = [
  { href: '/admin',           label: 'Dashboard' },
  { href: '/admin/mesas',     label: 'Mesas' },
  { href: '/admin/platos',    label: 'Platos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/usuarios',  label: 'Usuarios' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-56 shrink-0 h-screen fixed flex flex-col
                 bg-slate-900/80 backdrop-blur border-r border-slate-800 p-4">
      <h2 className="text-xl font-bold mb-6">ADMIN</h2>

      <nav className="flex-1 space-y-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block px-3 py-2 rounded-lg transition-colors
              ${pathname === href
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-200'}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* botón de cerrar sesión en la parte inferior */}
      <LogoutButton />
    </aside>
  );
}
