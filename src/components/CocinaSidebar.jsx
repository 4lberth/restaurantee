'use client';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default function CocinaSidebar() {
  return (
    <aside
      className="w-56 h-screen shrink-0 fixed flex flex-col
                 bg-slate-900/80 backdrop-blur border-r border-slate-800 p-4">
      <h2 className="text-xl font-bold mb-6">COCINA</h2>

      <nav className="flex-1 space-y-1">
        <Link
          href="/cocina"
          className="block px-3 py-2 rounded-lg bg-emerald-600 text-white"
        >
          Órdenes
        </Link>
      </nav>

      <LogoutButton />
    </aside>
  );
}
