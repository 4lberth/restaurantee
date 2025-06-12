// src/components/FormInput.jsx
'use client';      // 👈  ➜ obliga a que se renderice solo en el cliente

export default function FormInput({ label, type = 'text', ...props }) {
  return (
    <label className="block mb-4">
      <span className="block mb-1 font-medium">{label}</span>
      <input
        type={type}
        className="w-full px-4 py-2 rounded-lg bg-slate-800/70
                   placeholder-slate-400 focus:outline-none
                   focus:ring-2 focus:ring-emerald-400"
        {...props}
      />
    </label>
  );
}
