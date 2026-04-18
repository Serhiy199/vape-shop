import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/logout";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button type="submit" variant="outline">
        Вийти
      </Button>
    </form>
  );
}
