export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-3xl text-center px-6">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 mb-4">
          StackSpend
        </p>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          Your AI Stack Is Probably Overpriced
        </h1>

        <p className="text-zinc-400 text-lg mb-8">
          Audit AI subscriptions, API usage, and team plans to uncover hidden
          savings in minutes.
        </p>

        <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
          Audit My Stack
        </button>
      </div>
    </main>
  );
}