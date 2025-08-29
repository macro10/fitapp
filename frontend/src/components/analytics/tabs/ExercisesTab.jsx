import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";

export default function ExercisesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exercise Analysis</CardTitle>
        <p className="text-muted-foreground">
          Coming soon: Track individual exercise progress
        </p>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
        This feature is coming soon
      </CardContent>
    </Card>
  );
}
