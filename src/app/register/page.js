'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'mozo'
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Error al registrar');
    } else {
      router.push('/login');
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Registro</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="space-y-4">
        <input
          name="nombre"
          value={form.nombre}
          onChange={onChange}
          placeholder="Nombre"
          className="w-full border p-2 rounded"
          required
        />
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
        <select
          name="rol"
          value={form.rol}
          onChange={onChange}
          className="w-full border p-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="mozo">Mozo</option>
          <option value="cocina">Cocina</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Registrarse
        </button>
        <p className="text-center text-sm">
          ¿Ya tienes cuenta? <a href="/login" className="text-blue-600">Inicia sesión</a>
        </p>
      </div>
    </form>
  );
}
