import { Card } from "../../ui/card";
import VolumeProgressCard from "../cards/VolumeProgressCard";
import TopWorkoutsCard from "../cards/TopWorkoutsCard";
import WorkoutFrequencyCard from "../cards/WorkoutFrequencyCard";

export default function OverallProgressTab() {
  return (
    <div className="grid gap-4">
      <VolumeProgressCard />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopWorkoutsCard />
        <WorkoutFrequencyCard />
      </div>
    </div>
  );
}