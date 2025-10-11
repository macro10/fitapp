// frontend/src/components/analytics/charts/WeeklyFrequencyChart.js
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { subMonths, format, startOfISOWeek } from 'date-fns';
import { getWeeklyFrequencyAnalytics } from '../../../api';

const getAccentColor = () => {
  if (typeof window === 'undefined') return '#22c55e';
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  return raw ? `hsl(${raw})` : '#22c55e';
};

const WeeklyFrequencyChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const startDate = subMonths(new Date(), 6).toISOString();
        const endDate = new Date().toISOString();

        const response = await getWeeklyFrequencyAnalytics(startDate, endDate, {
          signal: controller.signal,
        });
        const weekly = response.weekly_frequency || [];

        // Exclude the current (in-progress) ISO week from the chart
        const currentIsoWeek = format(new Date(), "RRRR-'W'II");
        const filtered = weekly.filter((d) => d?.week !== currentIsoWeek);

        setData(filtered);
        setError(null);
      } catch (err) {
        if (
          err.code !== 'ERR_CANCELED' &&
          err.name !== 'CanceledError' &&
          err.name !== 'AbortError'
        ) {
          console.error('Error fetching frequency analytics:', err);
          setError('Failed to load workout frequency');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const formatWeekLabel = (weekStr) => {
    try {
      const [year, wk] = weekStr.split('-W');
      const date = new Date(Number(year), 0, 1);
      date.setDate(date.getDate() + (Number(wk) - 1) * 7);
      const weekStart = startOfISOWeek(date);
      return format(weekStart, 'MMM d');
    } catch {
      return weekStr;
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  const accent = getAccentColor();

  return (
    <div className="weekly-frequency-chart w-full select-none outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 20, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="10 10"
            stroke="rgba(148, 163, 184, 0.25)"
          />

          <XAxis
            dataKey="week"
            stroke="#888888"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={formatWeekLabel}
            interval="preserveStartEnd"
            minTickGap={28}
            height={24}
            tickMargin={10}
          />

          <YAxis
            stroke="#888888"
            tick={{ fill: '#9CA3AF' }}
            width={36}
            allowDecimals={false}
            tickLine={false}
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.45)', strokeWidth: 1.25, strokeLinecap: 'round' }}
          />

          <Tooltip
            cursor={{ stroke: 'rgba(148, 163, 184, 0.35)', strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'rgba(24, 24, 27, 0.95)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '10px',
            }}
            formatter={(value) => [value, 'Workouts']}
            labelFormatter={(label) => formatWeekLabel(label)}
            wrapperStyle={{ zIndex: 1000 }}
          />

          <Bar
            dataKey="workoutCount"
            name="Workouts"
            fill={accent}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyFrequencyChart;