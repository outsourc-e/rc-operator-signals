import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { dashboard } from '../lib/data';
import { shortDate } from '../lib/format';
import { ChartTooltip } from './ChartTooltip';

export function HeroChart() {
  const data = useMemo(() => {
    const rev = dashboard.series.revenue ?? [];
    const mrr = dashboard.series.mrr ?? [];
    const mrrByDate = new Map(mrr.map((r) => [String(r.date), Number(r.value) || 0]));
    return rev.map((r) => ({
      label: shortDate(String(r.date)),
      date: String(r.date),
      Revenue: Number(r.value) || 0,
      MRR: mrrByDate.get(String(r.date)) ?? null,
    }));
  }, []);

  // Find last point where Revenue spikes while MRR stays flat — the contradiction marker
  const annotation = useMemo(() => {
    for (let i = data.length - 1; i >= 5; i--) {
      const revNow = data[i].Revenue;
      const revPrev = data[i - 3].Revenue || 0.0001;
      const mrrNow = data[i].MRR ?? 0;
      const mrrPrev = data[i - 3].MRR ?? 0;
      const revDelta = (revNow - revPrev) / (revPrev || 1);
      const mrrDelta = mrrPrev ? (mrrNow - mrrPrev) / mrrPrev : 0;
      if (revDelta > 0.12 && Math.abs(mrrDelta) < 0.03) {
        return { index: i, label: data[i].label, revenue: revNow };
      }
    }
    return null;
  }, [data]);

  return (
    <div className="hero-chart">
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fill-revenue-hero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F4813F" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#F4813F" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef0f3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={32} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `$${v}`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => `$${v}`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke="#F4813F" fill="url(#fill-revenue-hero)" strokeWidth={2.5} />
            <Line yAxisId="right" type="monotone" dataKey="MRR" stroke="#0e78a6" strokeWidth={2.5} dot={false} />
            {annotation && (
              <ReferenceDot yAxisId="left" x={annotation.label} y={annotation.revenue} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} label={{ value: 'Divergence', position: 'top', fill: '#ef4444', fontSize: 11 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {annotation && (
        <div className="hero-annotation">
          <span className="annotation-dot" />
          <span>
            <strong>{annotation.label}:</strong> Revenue spike with flat MRR — likely non-recurring purchases (consumables, one-time unlocks). MRR is the real recurring-revenue story.
          </span>
        </div>
      )}
    </div>
  );
}
