import React from 'react';
import Svg, { Path, Line, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import type { XrayFluxPoint } from '@astroset/core';

const W = 340;
const H = 190;
const PAD_L = 30;
const PAD_R = 24;
const PAD_T = 10;
const PAD_B = 20;
const MIN_EXP = -8;
const MAX_EXP = -3;

interface Threshold {
  label: string;
  flux: number;
  color: string;
}

const THRESHOLDS: Threshold[] = [
  { label: 'A', flux: 1e-8, color: '#6b7280' },
  { label: 'B', flux: 1e-7, color: '#9ca3af' },
  { label: 'C', flux: 1e-6, color: '#10b981' },
  { label: 'M', flux: 1e-5, color: '#f59e0b' },
  { label: 'X', flux: 1e-4, color: '#ef4444' },
];

function xFor(index: number, count: number): number {
  return PAD_L + (count <= 1 ? 0 : (index / (count - 1)) * (W - PAD_L - PAD_R));
}

function yFor(flux: number): number {
  const exp = Math.log10(Math.max(flux, 1e-9));
  const t = Math.min(1, Math.max(0, (exp - MIN_EXP) / (MAX_EXP - MIN_EXP)));
  return PAD_T + (1 - t) * (H - PAD_T - PAD_B);
}

function buildPaths(points: XrayFluxPoint[]): { line: string; area: string } | null {
  if (points.length < 2) return null;

  const coords = points.map((p, i) => ({ x: xFor(i, points.length), y: yFor(p.flux) }));
  const baseY = H - PAD_B;
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const first = coords[0];
  const last = coords[coords.length - 1];
  const area = `${line} L${last.x.toFixed(1)},${baseY} L${first.x.toFixed(1)},${baseY} Z`;
  return { line, area };
}

interface XrayChartProps {
  points: XrayFluxPoint[];
}

export default function XrayChart({ points }: XrayChartProps) {
  const paths = buildPaths(points);

  const dayTicks: { x: number; label: string }[] = [];
  let lastDay = '';
  points.forEach((p, i) => {
    const day = p.timestamp.split('T')[0];
    if (day !== lastDay) {
      lastDay = day;
      dayTicks.push({
        x: xFor(i, points.length),
        label: new Date(p.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      });
    }
  });

  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id="xrayFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f59e0b" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#f59e0b" stopOpacity={0.02} />
        </LinearGradient>
      </Defs>

      {THRESHOLDS.map((t) => {
        const y = yFor(t.flux);
        return (
          <React.Fragment key={t.label}>
            <Line
              x1={PAD_L}
              y1={y}
              x2={W - PAD_R}
              y2={y}
              stroke={t.color}
              strokeOpacity={0.35}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <SvgText
              x={W - PAD_R + 6}
              y={y}
              alignmentBaseline="central"
              fill={t.color}
              fontSize={10}
              fontWeight="600"
            >
              {t.label}
            </SvgText>
          </React.Fragment>
        );
      })}

      {dayTicks.slice(1).map((tick) => (
        <Line
          key={`grid-${tick.label}`}
          x1={tick.x}
          y1={PAD_T}
          x2={tick.x}
          y2={H - PAD_B}
          stroke="#3a3a6a"
          strokeWidth={1}
        />
      ))}

      {paths && (
        <>
          <Path d={paths.area} fill="url(#xrayFill)" />
          <Path d={paths.line} fill="none" stroke="#fbbf24" strokeWidth={1.5} />
        </>
      )}

      <SvgText x={PAD_L} y={H - 6} fill="#a0a0cc" fontSize={9}>
        {dayTicks[0]?.label}
      </SvgText>
      <SvgText x={W - PAD_R} y={H - 6} textAnchor="end" fill="#a0a0cc" fontSize={9}>
        {dayTicks[dayTicks.length - 1]?.label}
      </SvgText>
      <SvgText x={4} y={PAD_T + 8} fill="#a0a0cc" fontSize={9}>
        W/m²
      </SvgText>
    </Svg>
  );
}
