// frontend/src/components/analytics/WeeklyVolumeChart.js
import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { subMonths } from 'date-fns';
import { getWeeklyVolumeAnalytics } from '../../../api';
import { format, startOfISOWeek, endOfISOWeek, isSameMonth } from 'date-fns';

const getAccentColor = () => {
  if (typeof window === 'undefined') return '#22c55e'; // fallback
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  return raw ? `hsl(${raw})` : '#22c55e';
};

// Week helpers for clear labels
const getWeekRange = (weekStr) => {
  const [year, wk] = weekStr.split('-W');
  const date = new Date(Number(year), 0, 1);
  date.setDate(date.getDate() + (Number(wk) - 1) * 7);
  const start = startOfISOWeek(date);
  const end = endOfISOWeek(date);
  return { start, end };
};

const formatWeekStartLabel = (weekStr) => {
  try {
    const { start } = getWeekRange(weekStr);
    return format(start, 'MMM d');
  } catch {
    return weekStr;
  }
};

const formatWeekRangeLabel = (weekStr) => {
  try {
    const { start, end } = getWeekRange(weekStr);
    const endFmt = isSameMonth(start, end) ? 'd' : 'MMM d';
    return `Week of ${format(start, 'MMM d')}–${format(end, endFmt)}`;
  } catch {
    return weekStr;
  }
};

const WeeklyVolumeChart = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const startDate = subMonths(new Date(), 6).toISOString();
        const endDate = new Date().toISOString();

        const response = await getWeeklyVolumeAnalytics(startDate, endDate, {
          signal: controller.signal,
        });

        const weekly = response.weekly_volumes || [];

        // Exclude the current (in-progress) ISO week from the chart
        const currentIsoWeek = format(new Date(), "RRRR-'W'II");
        const filtered = weekly.filter((d) => d?.week !== currentIsoWeek);

        setData(filtered);
        setError(null);
      } catch (error) {
        if (
          error.code !== 'ERR_CANCELED' &&
          error.name !== 'CanceledError' &&
          error.name !== 'AbortError'
        ) {
          console.error('Error fetching analytics:', error);
          setError('Failed to load workout data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center p-4">{error}</div>;

  const accent = getAccentColor();

  return (
    <div className="weekly-volume-chart w-full select-none outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]">
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
        >
          <defs>
            <linearGradient id="totalArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accent} stopOpacity={0.24} />
              <stop offset="95%" stopColor={accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            strokeDasharray="10 10"
            stroke="rgba(148, 163, 184, 0.25)"
          />

          <XAxis
            dataKey="week"
            stroke="#888888"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
            tickFormatter={formatWeekStartLabel}
            interval="preserveStartEnd"
            minTickGap={28}
            height={24}
            tickMargin={10}
          />

          <YAxis
            stroke="#888888"
            tick={{ fill: '#9CA3AF' }}
            width={42}
            tickFormatter={(value) => (value === 0 ? '' : `${Math.round(value / 1000)}k`)}
            tickCount={4}
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.45)', strokeWidth: 1.25, strokeLinecap: 'round' }}
            tickLine={false}
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
            formatter={(value, name) => {
              const isTotal = name === 'Total' || name === 'Total Volume';
              const color = isTotal ? accent : '#94a3b8';
              return [`${(value / 1000).toFixed(1)}k`, name, { color }];
            }}
            labelFormatter={(label) => formatWeekRangeLabel(label)}
            wrapperStyle={{ zIndex: 1000 }}
            itemSorter={(item) => (item.dataKey === 'totalVolume' ? -1 : 1)}
          />

          {/* Total as filled area (primary), Average as secondary line */}
          <Area
            type="monotone"
            dataKey="totalVolume"
            name="Total"
            stroke={accent}
            fill="url(#totalArea)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: accent }}
          />

          <Line
            type="monotone"
            dataKey="avgVolumePerWorkout"
            name="Average"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyVolumeChart;