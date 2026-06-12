export function AccountFormStatus({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={
        error
          ? "border-destructive/20 bg-destructive/8 text-destructive rounded-lg border px-4 py-3 text-sm"
          : "border-primary/20 bg-primary/8 rounded-lg border px-4 py-3 text-sm"
      }
    >
      {error ?? success}
    </div>
  );
}
