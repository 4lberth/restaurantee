// src/app/(auth)/register/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/AuthCard';
import FormInput from '@/components/FormInput';

export default function RegisterPage() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const { error } = await res.json();
        setError(error || 'Error al registrar');
        return;
      }
      
      router.push('/login');
    } catch (err) {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidForm = form.nombre && form.email && form.password && form.email.includes('@');

  return (
    <div className="fixed inset-0 bg-gray-800 flex items-center justify-center p-4">
      
      {/* Card principal */}
      <div className="w-full max-w-4xl h-auto bg-gray-800 rounded-3xl shadow-2xl overflow-hidden
                      border border-gray-700 relative">
        
        {/* Fondo diagonal */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Lado derecho - gradiente diagonal que cubre completamente */}
          <div className="absolute -top-10 -right-10 w-4/5 h-[120%] bg-gradient-to-br from-orange-500 via-red-500 to-red-600
                          transform skew-x-12 origin-top-right"></div>
          
          {/* Elementos decorativos */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        </div>

        <div className="relative z-10 flex min-h-[600px]">
          
          {/* Panel izquierdo - Register */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Sign Up</h1>
                <p className="text-gray-400 text-sm">
                  Crea tu cuenta para comenzar
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                
                <FormInput 
                  label="Nombre completo" 
                  name="nombre" 
                  type="text" 
                  value={form.nombre} 
                  onChange={onChange}
                  placeholder="Ingresa tu nombre completo"
                  required
                  icon="user"
                />
                
                <FormInput 
                  label="Email" 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={onChange}
                  placeholder="ejemplo@correo.com"
                  required
                  icon="email"
                />
                
                <FormInput 
                  label="Contraseña" 
                  name="password" 
                  type="password" 
                  value={form.password} 
                  onChange={onChange}
                  placeholder="Crea una contraseña segura"
                  required
                  icon="lock"
                />

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading || !isValidForm}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 
                             hover:from-orange-600 hover:to-red-700 
                             disabled:from-gray-600 disabled:to-gray-700
                             text-white font-medium py-3 px-6 rounded-xl
                             transition-all duration-300 disabled:cursor-not-allowed
                             shadow-lg hover:shadow-orange-500/25"
                >
                  {isLoading ? 'Registrando...' : 'Crear cuenta'}
                </button>

                <div className="text-center">
                  <span className="text-gray-400 text-sm">
                    ¿Ya tienes cuenta? 
                    <button 
                      type="button" 
                      onClick={() => router.push('/login')}
                      className="text-orange-400 hover:text-orange-300 ml-1 font-medium transition-colors duration-200"
                    >
                      Inicia sesión
                    </button>
                  </span>
                </div>
              </form>
            </div>
          </div>

          {/* Panel derecho - Welcome */}
          <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center 
                          text-white p-12 relative">
            
            <div className="text-center z-10">
              <h2 className="text-4xl font-bold mb-4">
                JOIN US<br/>TODAY!
              </h2>
              <p className="text-white/80 leading-relaxed max-w-xs">
                Únete a nuestra comunidad y comienza a disfrutar de todos los beneficios que tenemos para ti.
              </p>
            </div>

            {/* Elementos decorativos adicionales */}
            <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="absolute top-1/2 right-1/6 w-1.5 h-1.5 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}