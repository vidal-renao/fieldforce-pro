export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <section className="w-full max-w-2xl space-y-6" aria-labelledby="page-title">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          VIDAL ECOSYSTEM
        </p>
        <h1 id="page-title" className="text-4xl font-bold tracking-tight sm:text-5xl">
          FieldForce Pro
        </h1>
        <p className="text-lg leading-relaxed text-slate-300">
          Plataforma de gestión de servicios de campo en desarrollo.
        </p>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold">Estado del proyecto</h2>
          <p className="mt-2 text-slate-300">
            Esta es una página provisional. La autenticación, el panel operativo
            y las integraciones aún no están disponibles desde esta interfaz.
          </p>
        </div>
        <footer className="text-sm text-slate-400">© VIDAL ECOSYSTEM</footer>
      </section>
    </main>
  );
}
