import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <Card className="border-border/70 bg-background/80 shadow-none">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">ADMIN only</Badge>
          <Badge variant="outline">/admin/users</Badge>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Доступ до admin users підтверджено
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground space-y-3 text-sm leading-6">
        <p>
          Ця сторінка існує як контрольна точка для перевірки захисту вкладених
          маршрутів усередині <code>/admin/*</code>.
        </p>
        <p>
          Якщо її бачить тільки ADMIN, значить периметр і server-side guard
          працюють разом коректно.
        </p>
      </CardContent>
    </Card>
  );
}
