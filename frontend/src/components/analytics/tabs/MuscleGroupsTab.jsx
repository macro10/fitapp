import { useEffect, useState } from "react";
import { getMuscleGroupsSummary } from "../../../api";
import ThisWeekByGroupCard from "../cards/ThisWeekByGroupCard";
import WeeklyGroupVolumeCard from "../cards/WeeklyGroupVolumeCard";
import GroupFrequencyCard from "../cards/GroupFrequencyCard";
import BalanceCard from "../cards/BalanceCard";
import RecencyCard from "../cards/RecencyCard";

export default function MuscleGroupsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await getMuscleGroupsSummary({ weeks: 12, currentWindow: 2, threshold: 0.2 });
        if (active) setData(d);
      } catch (e) {
        if (active) setError(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="text-muted-foreground">Loading muscle groups…</div>;
  if (error) return <div className="text-destructive">Failed to load muscle groups.</div>;
  if (!data) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ThisWeekByGroupCard data={data.currentVsLast} />
      <WeeklyGroupVolumeCard weekly={data.weekly} />
      <GroupFrequencyCard weekly={data.weekly} />
      <BalanceCard balance={data.balance} />
      <RecencyCard recencyDays={data.recencyDays} />
    </div>
  );
}