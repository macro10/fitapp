// frontend/src/components/analytics/WeeklyVolumeChart.js
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subMonths } from 'date-fns';
import { getWeeklyVolumeAnalytics } from '../../../api';
import { format, startOfISOWeek } from 'date-fns';

const getAccentColor = () => {
  if (typeof window === 'undefined') return '#22c55e'; // fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  return raw ? `hsl(${raw})` : '#22c55e';
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

        const response = await getWeeklyVolumeAnalytics(startDate, endDate, { signal: controller.signal });
        setData(response.weekly_volumes || []);
        setError(null);
      } catch (error) {
        // Ignore aborts; handle real errors
        if (error.code !== 'ERR_CANCELED' && error.name !== 'CanceledError' && error.name !== 'AbortError') {
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

  const formatWeekLabel = (weekStr) => {
    try {
      // Parse the year and week number from the string (e.g., "2025-W31")
      const [year, week] = weekStr.split('-W');
      
      // Create a date from the year and week number
      const date = new Date(year);
      date.setDate(date.getDate() + (week - 1) * 7);
      
      const weekStart = startOfISOWeek(date);
      
      // Format as "MMM d" or just "d" if in same month
      return format(weekStart, 'MMM d');
    } catch (e) {
      console.error('Error parsing date:', e);
      return weekStr;
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4">
      {error}
    </div>
  );

  return (
    <div className="weekly-volume-chart w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <XAxis 
            dataKey="week" 
            stroke="#888888"
            tick={{ 
              fill: '#888888',
              fontSize: 12,
              dy: 10
            }}
            tickFormatter={formatWeekLabel}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis 
            stroke="#888888"
            tick={{ fill: '#888888' }}
            width={35}  // Reduced from 60
            tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            dx={-10}   // Move the axis labels left
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(24, 24, 27, 0.9)',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '12px'
            }}
            formatter={(value, name) => {
              const accent = getAccentColor();
              const isTotal = name === "Total" || name === "Total Volume";
              const color = isTotal ? accent : "#94a3b8";
              return [
                `${(value / 1000).toFixed(1)}k`,
                name,
                { color }
              ];
            }}
            labelFormatter={(label) => formatWeekLabel(label)}
            wrapperStyle={{ zIndex: 1000 }}
            itemSorter={(item) => {
              // Sort Total Volume first, then Avg Volume
              return item.dataKey === "totalVolume" ? -1 : 1;
            }}
          />
          {/* <Legend 
            verticalAlign="top"
            height={36}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{
              paddingBottom: '20px'
            }}
          /> */}
          <Line 
            type="monotone" 
            dataKey="avgVolumePerWorkout"
            stroke="#94a3b8" // text-gray-400 (silver)
            name="Average"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            type="monotone" 
            dataKey="totalVolume" 
            stroke={getAccentColor()}
            name="Total"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: getAccentColor() }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyVolumeChart;