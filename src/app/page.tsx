import AuditForm from "./components/AuditForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center mb-12">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">
          StackSpend
        </p>

        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
          Audit Your AI Stack
        </h1>

        <p className="text-zinc-400 text-base">
          Find out if you&apos;re overpaying for your AI tools in under 30
          seconds.
        </p>
      </div>

      <AuditForm />
    </main>
  );
}