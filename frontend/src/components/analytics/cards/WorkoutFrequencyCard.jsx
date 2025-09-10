import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";

export default function WorkoutFrequencyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Frequency</CardTitle>
        <p className="text-muted-foreground">
          Your workout consistency
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
