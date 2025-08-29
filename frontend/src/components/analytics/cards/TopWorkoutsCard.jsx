import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";

export default function TopWorkoutsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Workouts</CardTitle>
        <p className="text-muted-foreground">
          Your strongest performances
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Coming Soon
        </div>
      </CardContent>
    </Card>
  );
}
