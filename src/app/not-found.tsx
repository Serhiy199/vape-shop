export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="border-border/70 bg-card max-w-md space-y-3 rounded-3xl border p-10 text-center shadow-sm">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Сторінку не знайдено
        </h1>
        <p className="text-muted-foreground">
          Каркас застосунку працює, але цей маршрут ще не реалізований.
        </p>
      </div>
    </main>
  );
}
