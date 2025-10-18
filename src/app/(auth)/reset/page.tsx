"use client";
export default function ResetPage() {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) alert("Пароль обновлён");
  }
  return (
    <main className="container">
      <h1 className="text-2xl font-semibold">Сброс пароля</h1>
      <form className="rounded-xl p-6 mt-6 grid gap-3" style={{ background: "var(--surface)" }} onSubmit={onSubmit}>
        <input name="token" placeholder="Токен" className="bg-transparent border rounded px-3 py-2" required />
        <input name="newPassword" placeholder="Новый пароль" type="password" className="bg-transparent border rounded px-3 py-2" required />
        <button className="px-4 py-2 rounded bg-[var(--accent)] text-white">Обновить пароль</button>
      </form>
    </main>
  );
}


