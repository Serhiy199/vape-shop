import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,oklch(0.92_0.05_36_/_0.45),transparent_28%),radial-gradient(circle_at_bottom_right,oklch(0.95_0.04_86_/_0.7),transparent_34%)]" />
      <RegisterForm />
    </main>
  );
}
