import { auth } from "@/lib/auth/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { SessionCard } from "@/features/auth/components/session-card";

export default async function AdminHomePage() {
  const session = await auth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
      <Card className="border-border/70 max-w-3xl shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Admin Shell</Badge>
            <Badge variant="outline">Bootstrap</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm uppercase tracking-[0.24em]">
              Admin
            </p>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Admin control surface
            </CardTitle>
            <p className="text-muted-foreground">
              Starter page for future categories, products, orders, and SEO
              modules.
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionCard session={session} variant="admin" />
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Categories</TableCell>
                <TableCell className="text-muted-foreground">
                  Route structure is ready
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Products</TableCell>
                <TableCell className="text-muted-foreground">
                  Feature code can land here next
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Orders</TableCell>
                <TableCell className="text-muted-foreground">
                  Layout and table primitives are in place
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
