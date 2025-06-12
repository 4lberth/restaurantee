'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const salir = async () => {
    setLoading(true);
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');       // ← regresa a login
  };

  return (
    <button
      onClick={salir}
      disabled={loading}
      className="mt-auto w-full px-3 py-2 rounded-lg bg-red-600/80
                 hover:bg-red-700 disabled:opacity-40"
    >
      Cerrar sesión
    </button>
  );
}
