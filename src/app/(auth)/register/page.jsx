// src/app/(auth)/register/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import FormInput from '@/components/FormInput';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre:'', email:'', password:'' });
  const [error, setError] = useState('');
  const router = useRouter();

  const onChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');

    /* 👇  ya NO enviamos rol; el backend lo pondrá por defecto */
    const res = await fetch('/api/register', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body:JSON.stringify(form),
    });

    if (!res.ok) {
      const { error } = await res.json();
      return setError(error || 'Error');
    }
    router.push('/login');
  };

  return (
    <AuthCard title="Crear cuenta">
      <form onSubmit={onSubmit} className="space-y-2">
        <FormInput label="Nombre"      name="nombre"     value={form.nombre}     onChange={onChange}/>
        <FormInput label="Email"       name="email"      type="email"           value={form.email}      onChange={onChange}/>
        <FormInput label="Contraseña"  name="password"   type="password"        value={form.password}   onChange={onChange}/>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button className="w-full py-2 mt-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors">
          Registrar
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-emerald-400 hover:underline">Inicia sesión</a>
      </p>
    </AuthCard>
  );
}
