import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountPage() {
  return (
    <Card className="border-border/70 bg-background/80 shadow-none">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">Лише для клієнта</Badge>
          <Badge variant="outline">/account</Badge>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Доступ до кабінету підтверджено
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-6">
        <p className="text-muted-foreground">
          Якщо ви бачите цю сторінку, значить маршрут <code>/account/*</code>{" "}
          уже захищений і пропускає лише авторизованих користувачів.
        </p>
        <p className="text-muted-foreground">
          На наступних етапах сюди можна буде додати профіль, адреси,
          замовлення, wishlist та інші приватні модулі клієнта.
        </p>
      </CardContent>
    </Card>
  );
}
