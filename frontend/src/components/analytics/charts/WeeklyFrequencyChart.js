// frontend/src/components/analytics/charts/WeeklyFrequencyChart.js
import { useState, useEffect, useMemo, useId } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
  LabelList,
} from 'recharts';
import { subMonths, format, startOfISOWeek, endOfISOWeek, isSameMonth } from 'date-fns';
import { getWeeklyFrequencyAnalytics } from '../../../api';

const getAccentColor = () => {
  if (typeof window === 'undefined') return '#22c55e';
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent')
    .trim();
  return raw ? `hsl(${raw})` : '#22c55e';
};

// Derive ISO week start/end from "YYYY-Www"
const getWeekRange = (weekStr) => {
  const [year, wk] = weekStr.split('-W');
  const date = new Date(Number(year), 0, 1);
  date.setDate(date.getDate() + (Number(wk) - 1) * 7);
  const start = startOfISOWeek(date);
  const end = endOfISOWeek(date);
  return { start, end };
};

// Compact tick label
const formatWeekStartLabel = (weekStr) => {
  try {
    const { start } = getWeekRange(weekStr);
    return format(start, 'MMM d');
  } catch {
    return weekStr;
  }
};

// Tooltip label: full range
const formatWeekRangeLabel = (weekStr) => {
  try {
    const { start, end } = getWeekRange(weekStr);
    const endFmt = isSameMonth(start, end) ? 'd' : 'MMM d';
    return `Week of ${format(start, 'MMM d')}–${format(end, endFmt)}`;
  } catch {
    return weekStr;
  }
};

const WeeklyFrequencyChart = ({ onHover, onStats }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const gradId = useId();

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

        // Exclude current in-progress ISO week
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

  // Aggregate stats for chips and reference line
  const avg = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((a, b) => a + (b.workoutCount || 0), 0) / data.length;
  }, [data]);

  const maxVal = useMemo(() => {
    return data.length ? Math.max(...data.map((d) => d.workoutCount || 0)) : 0;
  }, [data]);

  const bestIndices = useMemo(() => {
    if (!data.length) return [];
    return data
      .map((d, i) => ((d.workoutCount || 0) === maxVal ? i : -1))
      .filter((i) => i !== -1);
  }, [data, maxVal]);

  // Give some headroom so tall bars don't hit the top
  const yMax = useMemo(() => Math.max(4, maxVal + 1), [maxVal]);

  useEffect(() => {
    onStats?.({ avg, max: maxVal, weeks: data.length });
  }, [avg, maxVal, data.length, onStats]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  if (!data.length)
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground/80">
        No weekly sessions in this range
      </div>
    );

  const accent = getAccentColor();

  return (
    <div
      className="weekly-frequency-chart w-full select-none outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]"
      role="img"
      aria-label="Weekly workout sessions over the last six months"
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 2, bottom: 8 }}
          barCategoryGap="22%"
          barGap={4}
          onMouseLeave={() => {
            setHoverIndex(-1);
            onHover?.(null);
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.72" />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            strokeDasharray="10 10"
            stroke="rgba(148, 163, 184, 0.22)"
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
            tick={{ fill: '#A1A1AA', fontSize: 12 }}
            width={36}
            allowDecimals={false}
            tickLine={false}
            axisLine={{ stroke: 'rgba(148, 163, 184, 0.45)', strokeWidth: 1.25, strokeLinecap: 'round' }}
            domain={[0, yMax]}
          />

          <Tooltip
            cursor={{ fill: 'transparent', stroke: 'rgba(148, 163, 184, 0.35)', strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'rgba(24, 24, 27, 0.95)',
              border: '1px solid rgba(148,163,184,0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '10px',
            }}
            itemStyle={{ color: '#E5E7EB' }}
            labelStyle={{ color: '#A3A3A3' }}
            formatter={(value) => [value, 'Workouts']}
            labelFormatter={(label) => formatWeekRangeLabel(label)}
            wrapperStyle={{ zIndex: 1000 }}
          />

          <ReferenceLine
            y={avg}
            stroke="rgba(148, 163, 184, 0.6)"
            strokeDasharray="4 4"
            ifOverflow="extendDomain"
            label={{
              value: `Avg ${avg.toFixed(1)}`,
              position: 'right',
              fill: 'rgba(148,163,184,0.9)',
              fontSize: 11,
              offset: 6,
            }}
          />

          <Bar
            dataKey="workoutCount"
            name="Workouts"
            fill={`url(#${gradId})`}
            radius={[6, 6, 0, 0]}
            isAnimationActive
            isUpdateAnimationActive={false}
            animationDuration={700}
          >
            <LabelList
              dataKey="workoutCount"
              position="top"
              offset={8}
              className="tabular-nums"
              fill="#CBD5E1"
              fontSize={11}
              isAnimationActive={false}
            />
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fillOpacity={hoverIndex === i ? 1 : 0.9}
                stroke={bestIndices.includes(i) ? 'rgba(255,255,255,0.9)' : 'none'}
                strokeWidth={bestIndices.includes(i) ? 1.25 : 0}
                onMouseEnter={() => {
                  setHoverIndex(i);
                  onHover?.({
                    ...entry,
                    hoverLabel: formatWeekRangeLabel(entry.week),
                  });
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyFrequencyChart;