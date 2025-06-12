'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const links = [
  { href:'/mozo/mesas',   label:'Mesas'   },
  { href:'/mozo/ordenes', label:'Órdenes' }
];

export default function MozoSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="w-56 fixed h-screen shrink-0 flex flex-col
                 bg-slate-900/80 backdrop-blur border-r border-slate-800 p-4">
      <h2 className="text-xl font-bold mb-6">MOZO</h2>

      <nav className="flex-1 space-y-1">
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded-lg transition-colors
              ${pathname.startsWith(l.href)
                ? 'bg-emerald-600 text-white'
                : 'hover:bg-slate-800 text-slate-200'}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <LogoutButton />
    </aside>
  );
}
