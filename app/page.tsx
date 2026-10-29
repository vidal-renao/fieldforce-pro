'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-blue-500">FieldForce Pro SaaS</h1>
        <p className="text-slate-300 text-sm">Plataforma de Gestion de Servicios de Campo activa en Vercel.</p>
        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-left text-xs font-mono text-emerald-400">
          <p>+ Next.js 14 App Router Activo</p>
          <p>+ Conectado con Supabase & GitHub</p>
          <p>+ Despliegue Vercel Ok</p>
        </div>
      </div>
    </main>
  );
}