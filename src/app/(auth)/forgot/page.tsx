"use client";
export default function ForgotPage() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) alert("Ссылка на восстановление отправлена (если email существует)");
  }
  return (
    <main className="container">
      <h1 className="text-2xl font-semibold">Восстановление пароля</h1>
      <form className="rounded-xl p-6 mt-6 grid gap-3" style={{ background: "var(--surface)" }} onSubmit={onSubmit}>
        <input name="email" placeholder="Email" type="email" className="bg-transparent border rounded px-3 py-2" required />
        <button className="px-4 py-2 rounded bg-[var(--accent)] text-white">Отправить</button>
      </form>
    </main>
  );
}


