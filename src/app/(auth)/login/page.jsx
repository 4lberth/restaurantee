// src/app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import FormInput from '@/components/FormInput';

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const router = useRouter();

  const onChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    const res  = await fetch('/api/login', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials:'include',
      body:JSON.stringify(form),
    });
    const body = await res.json();
    if (!res.ok) return setError(body.error || 'Error');

    // ⬇️ Redirección por rol
    const destino = body.rol === 'admin' ? '/admin' : body.rol === 'cocina' ? '/cocina' : body.rol === 'mozo' ? '/mozo' : '/';
    router.replace(destino);
  };

  return (
    <AuthCard title="Iniciar sesión">
      <form onSubmit={onSubmit} className="space-y-2">
        <FormInput label="Email"      name="email"    type="email"    value={form.email}    onChange={onChange}/>
        <FormInput label="Contraseña" name="password" type="password" value={form.password} onChange={onChange}/>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full py-2 mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors">
          Entrar
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="text-emerald-400 hover:underline">Regístrate</a>
      </p>
    </AuthCard>
  );
}
