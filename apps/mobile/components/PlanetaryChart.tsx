import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import type { PlanetPosition } from '@astroset/core';

const SIZE = 300;
const CENTER = SIZE / 2;
const RING_OUTER = 140;
const RING_INNER = 113;
const PLANET_R = 92;
const MIN_GAP = 11;

const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

function pointAt(r: number, lonDeg: number): { x: number; y: number } {
  const angle = ((180 - lonDeg) * Math.PI) / 180;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function spreadLongitudes(positions: PlanetPosition[]): number[] {
  const sorted = positions
    .map((p, index) => ({ index, lon: p.longitude }))
    .sort((a, b) => a.lon - b.lon);

  const result = new Array<number>(positions.length);
  let prev = sorted[0].lon - 360;
  for (const item of sorted) {
    const lon = Math.max(item.lon, prev + MIN_GAP);
    result[item.index] = lon;
    prev = lon;
  }
  return result.map((lon) => ((lon % 360) + 360) % 360);
}

interface PlanetaryChartProps {
  positions: PlanetPosition[];
}

export default function PlanetaryChart({ positions }: PlanetaryChartProps) {
  const displayLons = spreadLongitudes(positions);

  return (
    <View>
      <Svg width="100%" height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle cx={CENTER} cy={CENTER} r={RING_OUTER} fill="none" stroke="#3a3a6a" strokeWidth={1.5} />
        <Circle cx={CENTER} cy={CENTER} r={RING_INNER} fill="none" stroke="#3a3a6a" strokeWidth={1.5} />
        <Circle cx={CENTER} cy={CENTER} r={PLANET_R + 24} fill="rgba(74,158,255,0.03)" stroke="#3a3a6a" strokeWidth={0.5} strokeDasharray="2 4" />

        {SIGN_GLYPHS.map((glyph, i) => {
          const startLon = i * 30;
          const dividerStart = pointAt(RING_INNER, startLon);
          const dividerEnd = pointAt(RING_OUTER, startLon);
          const glyphPos = pointAt((RING_INNER + RING_OUTER) / 2, startLon + 15);
          return (
            <React.Fragment key={i}>
              <Line
                x1={dividerStart.x}
                y1={dividerStart.y}
                x2={dividerEnd.x}
                y2={dividerEnd.y}
                stroke="#3a3a6a"
                strokeWidth={1}
              />
              <SvgText
                x={glyphPos.x}
                y={glyphPos.y}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={14}
                fill="#a0a0cc"
              >
                {glyph}
              </SvgText>
            </React.Fragment>
          );
        })}

        {positions.map((p, i) => {
          const truePos = pointAt(PLANET_R + 13, p.longitude);
          const tickInner = pointAt(PLANET_R + 2, p.longitude);
          const markerPos = pointAt(PLANET_R - 11, displayLons[i]);
          return (
            <React.Fragment key={p.planet}>
              <Line
                x1={tickInner.x}
                y1={tickInner.y}
                x2={truePos.x}
                y2={truePos.y}
                stroke="#4a9eff"
                strokeWidth={1}
                opacity={0.6}
              />
              <Circle
                cx={markerPos.x}
                cy={markerPos.y}
                r={12}
                fill="#252547"
                stroke={p.retrograde ? '#ef4444' : '#4a9eff'}
                strokeWidth={1.2}
              />
              <SvgText
                x={markerPos.x}
                y={markerPos.y}
                textAnchor="middle"
                alignmentBaseline="central"
                fontSize={13}
                fill="#e0e0ff"
              >
                {p.glyph}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      <View style={styles.legend}>
        {positions.map((p) => (
          <View key={p.planet} style={styles.legendRow}>
            <Text style={styles.legendGlyph}>{p.glyph}</Text>
            <Text style={styles.legendName} numberOfLines={1}>
              {p.planet}
            </Text>
            <Text style={styles.legendPosition} numberOfLines={1}>
              {p.degreeInSign.toFixed(1)}° {p.sign}
            </Text>
            <Text style={[styles.legendRx, !p.retrograde && styles.legendRxHidden]}>
              ℞
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  legendRow: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
    paddingVertical: 4,
  },
  legendGlyph: {
    color: '#fbbf24',
    fontSize: 14,
    width: 18,
    textAlign: 'center',
  },
  legendName: {
    color: '#e0e0ff',
    fontSize: 12,
    width: 68,
    marginLeft: 4,
  },
  legendPosition: {
    color: '#a0a0cc',
    fontSize: 12,
    flex: 1,
    marginLeft: 4,
  },
  legendRx: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 11,
    width: 14,
    textAlign: 'center',
    marginLeft: 2,
  },
  legendRxHidden: {
    opacity: 0,
  },
});
