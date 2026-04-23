import { useMemo, useState } from 'react';
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

type ViewMode = 'combined' | 'revenue' | 'mrr' | 'normalized';

const viewLabels: Record<ViewMode, string> = {
  combined: 'Combined',
  revenue: 'Revenue',
  mrr: 'MRR',
  normalized: 'Indexed',
};

export function HeroChart() {
  const [view, setView] = useState<ViewMode>('combined');

  const rawData = useMemo(() => {
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

  const data = useMemo(() => {
    if (view !== 'normalized') return rawData;
    // Index to 100 at first point
    const firstRev = rawData.find((p) => p.Revenue)?.Revenue || 1;
    const firstMrr = rawData.find((p) => p.MRR)?.MRR || 1;
    return rawData.map((p) => ({
      ...p,
      Revenue: (p.Revenue / firstRev) * 100,
      MRR: p.MRR !== null ? (p.MRR / firstMrr) * 100 : null,
    }));
  }, [rawData, view]);

  const annotation = useMemo(() => {
    if (view === 'normalized') return null;
    for (let i = rawData.length - 1; i >= 5; i--) {
      const revNow = rawData[i].Revenue;
      const revPrev = rawData[i - 3].Revenue || 0.0001;
      const mrrNow = rawData[i].MRR ?? 0;
      const mrrPrev = rawData[i - 3].MRR ?? 0;
      const revDelta = (revNow - revPrev) / (revPrev || 1);
      const mrrDelta = mrrPrev ? (mrrNow - mrrPrev) / mrrPrev : 0;
      if (revDelta > 0.12 && Math.abs(mrrDelta) < 0.03) {
        return { label: rawData[i].label, revenue: revNow };
      }
    }
    return null;
  }, [rawData, view]);

  const showRevenue = view === 'combined' || view === 'revenue' || view === 'normalized';
  const showMrr = view === 'combined' || view === 'mrr' || view === 'normalized';
  const usePercent = view === 'normalized';

  return (
    <div className="hero-chart">
      <div className="hero-chart-top-row">
        <div className="hero-view-toggle" role="group" aria-label="Chart view">
          {(Object.keys(viewLabels) as ViewMode[]).map((m) => (
            <button
              key={m}
              className={`hero-view-btn ${view === m ? 'active' : ''}`}
              onClick={() => setView(m)}
            >
              {viewLabels[m]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fill-revenue-hero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EE5A60" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#EE5A60" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fill-mrr-hero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0e78a6" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#0e78a6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef0f3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={32} />
            {showRevenue && (
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#EE5A60' }}
                tickLine={false}
                axisLine={false}
                width={54}
                tickFormatter={(v) => (usePercent ? `${Math.round(v)}` : `$${Math.round(v).toLocaleString()}`)}
                label={usePercent ? undefined : { value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: '#EE5A60', fontSize: 11, offset: -4 }}
                domain={['dataMin - 5%', 'dataMax + 5%']}
              />
            )}
            {showMrr && !usePercent && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#0e78a6' }}
                tickLine={false}
                axisLine={false}
                width={54}
                tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`}
                label={{ value: 'MRR ($)', angle: 90, position: 'insideRight', fill: '#0e78a6', fontSize: 11, offset: -4 }}
                domain={['dataMin - 5%', 'dataMax + 5%']}
              />
            )}
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
            {showRevenue && (
              <Area
                yAxisId={usePercent ? 'left' : 'left'}
                type="monotone"
                dataKey="Revenue"
                stroke="#EE5A60"
                fill="url(#fill-revenue-hero)"
                strokeWidth={2.5}
              />
            )}
            {showMrr && (
              <>
                {view === 'mrr' ? (
                  <Area
                    yAxisId={usePercent ? 'left' : 'right'}
                    type="monotone"
                    dataKey="MRR"
                    stroke="#0e78a6"
                    fill="url(#fill-mrr-hero)"
                    strokeWidth={2.5}
                  />
                ) : (
                  <Line
                    yAxisId={usePercent ? 'left' : 'right'}
                    type="monotone"
                    dataKey="MRR"
                    stroke="#0e78a6"
                    strokeWidth={2.5}
                    dot={false}
                  />
                )}
              </>
            )}
            {annotation && view === 'combined' && (
              <ReferenceDot yAxisId="left" x={annotation.label} y={annotation.revenue} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} label={{ value: 'Divergence', position: 'insideTopLeft', fill: '#ef4444', fontSize: 11, offset: 10 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {view === 'normalized' && (
        <div className="hero-annotation" style={{ background: 'rgba(14, 120, 166, 0.06)', borderColor: 'rgba(14, 120, 166, 0.25)', color: '#0e5d83' }}>
          <span className="annotation-dot" style={{ background: '#0e78a6', boxShadow: '0 0 0 3px rgba(14,120,166,0.2)' }} />
          <span>Both series indexed to 100 on day one. Gap between lines = relative divergence.</span>
        </div>
      )}
    </div>
  );
}
