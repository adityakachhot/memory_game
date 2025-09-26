import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PVP() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">PVP</h1>
          <p className="text-muted-foreground">
            Head-to-head battles are coming soon.
          </p>
        </div>
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            We are working on real-time Player vs Player matches. Stay tuned!
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
