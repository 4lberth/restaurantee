'use client';
import styles from '@/styles/animations.module.css';

export default function AuthCard({ title, children }) {
  return (
    <div
      className={`${styles.fadeIn} w-full max-w-md mx-auto mt-24 p-8
                  rounded-2xl backdrop-blur bg-white/5 shadow-2xl`}>
      <h1 className="text-2xl font-semibold text-center mb-6">{title}</h1>
      {children}
    </div>
  );
}
