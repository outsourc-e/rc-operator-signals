import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SeriesPoint } from '../lib/data';
import { shortDate } from '../lib/format';
import { ChartTooltip } from './ChartTooltip';

type Kind = 'area' | 'line' | 'bar' | 'composed';

type Props = {
  title: string;
  subtitle?: string;
  series: SeriesPoint[];
  kind: Kind;
  color?: string;
  height?: number;
  children?: React.ReactNode;
};

export function ChartCard({ title, subtitle, series, kind, color = '#0e78a6', height = 260, children }: Props) {
  const data = series.map((p) => ({ ...p, label: shortDate(String(p.date)) }));
  const gradId = `fill-${title.replace(/\s+/g, '-').toLowerCase()}`;

  // Line and area charts: zoom to data range so flat metrics aren't invisible
  const yDomain: [string, string] | undefined = (kind === 'line' || kind === 'area')
    ? ['dataMin - 5%', 'dataMax + 5%']
    : undefined;

  return (
    <article className="chart-card">
      <div className="chart-card-header">
        <div>
          <div className="chart-card-title">{title}</div>
          {subtitle && <div className="chart-card-subtitle">{subtitle}</div>}
        </div>
        {children}
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          {kind === 'area' ? (
            <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} domain={yDomain} tickFormatter={(v) => typeof v === 'number' ? Math.round(v).toLocaleString() : v} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gradId})`} strokeWidth={2.5} />
            </AreaChart>
          ) : kind === 'line' ? (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} domain={yDomain} tickFormatter={(v) => typeof v === 'number' ? Math.round(v).toLocaleString() : v} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
            </LineChart>
          ) : kind === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => typeof v === 'number' ? Math.round(v).toLocaleString() : v} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey="New Trials" fill="#0e78a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expired Trials" fill="#00d5bf" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Movement" fill="#EE5A60" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#eef0f3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} minTickGap={28} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => typeof v === 'number' ? Math.round(v).toLocaleString() : v} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey="New Actives" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Resubscription Actives" fill="#0e78a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Churned Actives" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="Movement" stroke="#111827" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </article>
  );
}
