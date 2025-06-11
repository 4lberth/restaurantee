'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  const onChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Error al iniciar sesión');
    } else {
      // si devolviste el token en cookie solo redirige
      // y protege rutas con tu middleware
      router.push('/admin');
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Email"
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Contraseña"
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Entrar
        </button>
        <p className="text-center text-sm">
          ¿No tienes cuenta? <a href="/register" className="text-blue-600">Regístrate</a>
        </p>
      </div>
    </form>
  );
}
