import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import { Transaction } from '../types';
import { formatINR } from '../utils/currency';

interface Props {
  transactions: Transaction[];
}

interface MonthSlot {
  short: string;
  full: string;
  credit: number;
  debit: number;
}

// Chart palette (per design spec)
const CREDIT = '#10B981';
const DEBIT = '#EF4444';
const CREDIT_TEXT = '#059669';
const DEBIT_TEXT = '#DC2626';
const CREDIT_CAP = '#A7F3D0';
const DEBIT_CAP = '#FECACA';
const GRID = '#E2E8F0';
const AXIS_TEXT = '#64748B';
const TITLE = '#0F172A';
const TOOLTIP_BG = '#1E293B';

// Layout
const Y_AXIS_WIDTH = 40;
const PLOT_TOP = 24;
const PLOT_HEIGHT = 140;
const X_LABEL_HEIGHT = 24;
const CHART_HEIGHT = PLOT_TOP + PLOT_HEIGHT + X_LABEL_HEIGHT;
const MONTH_GAP = 6; // space between neighbouring months
const PAIR_GAP = 4; // space between the credit and debit bar of one month
const MIN_BAR_WIDTH = 14;
const MAX_BAR_WIDTH = 26;
const BAR_RADIUS = 6;
const MIN_BAR_HEIGHT = 2;
const TOOLTIP_WIDTH = 176;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLast6Months(transactions: Transaction[]): MonthSlot[] {
  const now = new Date();
  const slots: MonthSlot[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthName = MONTH_NAMES[d.getMonth()];
    const prefix = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    let credit = 0;
    let debit = 0;
    for (const t of transactions) {
      if (!t.date.startsWith(prefix)) continue;
      if (t.direction === 'credit') credit += t.amount;
      else debit += t.amount;
    }
    slots.push({ short: monthName, full: `${monthName} ${year}`, credit, debit });
  }
  return slots;
}

// Pick a "nice" tick step (1, 2, 2.5, 5 x 10^n) for the Y axis.
function niceStep(raw: number): number {
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

// Indian numbering: ₹0, ₹50K, ₹7.4K, ₹1.0L, ₹2.0L
function formatAxis(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return `₹${Math.round(value)}`;
}

function formatExact(value: number): string {
  return formatINR(value, Number.isInteger(value) ? 0 : 2);
}

// Bar path with rounded top corners only.
function topRoundedBar(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return [
    `M${x},${y + h}`,
    `L${x},${y + rr}`,
    `Q${x},${y} ${x + rr},${y}`,
    `L${x + w - rr},${y}`,
    `Q${x + w},${y} ${x + w},${y + rr}`,
    `L${x + w},${y + h}`,
    'Z',
  ].join(' ');
}

export default function MonthlyBarChart({ transactions }: Props) {
  const [chartWidth, setChartWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const months = useMemo(() => getLast6Months(transactions), [transactions]);

  const totalCredit = months.reduce((s, m) => s + m.credit, 0);
  const totalDebit = months.reduce((s, m) => s + m.debit, 0);

  // 25% headroom above the highest value so top labels never clip.
  const highest = Math.max(...months.map((m) => Math.max(m.credit, m.debit)), 0);
  const maxValue = (highest > 0 ? highest : 1000) * 1.25;
  const step = niceStep(maxValue / 4);
  const ticks: number[] = [];
  for (let k = 0; k * step <= maxValue; k++) ticks.push(k * step);

  const plotLeft = Y_AXIS_WIDTH;
  const plotWidth = Math.max(chartWidth - plotLeft, 0);
  const groupWidth = plotWidth / 6;
  // Bar width adapts to the available width, within the min/max range.
  const barWidth = Math.min(MAX_BAR_WIDTH, Math.max(MIN_BAR_WIDTH, (groupWidth - MONTH_GAP - PAIR_GAP) / 2));
  const pairWidth = barWidth * 2 + PAIR_GAP;
  const pairOffset = (groupWidth - pairWidth) / 2;
  const baseline = PLOT_TOP + PLOT_HEIGHT;

  const yFor = (v: number) => baseline - (v / maxValue) * PLOT_HEIGHT;
  const barHeight = (v: number) => (v > 0 ? Math.max((v / maxValue) * PLOT_HEIGHT, MIN_BAR_HEIGHT) : MIN_BAR_HEIGHT);

  function onLayout(e: LayoutChangeEvent) {
    setChartWidth(Math.round(e.nativeEvent.layout.width));
  }

  function toggle(i: number) {
    setSelected((prev) => (prev === i ? null : i));
  }

  const active = selected !== null ? months[selected] : null;
  const activeCenterX = selected !== null ? plotLeft + selected * groupWidth + groupWidth / 2 : 0;
  const tooltipLeft = Math.max(0, Math.min(activeCenterX - TOOLTIP_WIDTH / 2, chartWidth - TOOLTIP_WIDTH));
  const net = active ? active.credit - active.debit : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Last 6 Months</Text>
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: '#ECFDF5' }]}>
            <Text style={[styles.pillText, { color: CREDIT_TEXT }]}>Cr {formatAxis(totalCredit)}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.pillText, { color: DEBIT_TEXT }]}>Dr {formatAxis(totalDebit)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartArea} onLayout={onLayout}>
        {chartWidth > 0 && (
          <>
            <Svg width={chartWidth} height={CHART_HEIGHT}>
              {/* Highlight column for the selected month */}
              {selected !== null && (
                <Rect
                  x={plotLeft + selected * groupWidth + pairOffset - 4}
                  y={0}
                  width={pairWidth + 8}
                  height={baseline}
                  rx={8}
                  fill="#F1F5F9"
                />
              )}

              {/* Dashed gridlines and Y-axis labels */}
              {ticks.map((tick) => (
                <React.Fragment key={`tick-${tick}`}>
                  <Line
                    x1={plotLeft}
                    x2={chartWidth}
                    y1={yFor(tick)}
                    y2={yFor(tick)}
                    stroke={GRID}
                    strokeWidth={1}
                    strokeDasharray={[4, 4]}
                  />
                  <SvgText
                    x={plotLeft - 6}
                    y={yFor(tick) + 4}
                    fontSize={11}
                    fill={AXIS_TEXT}
                    textAnchor="end"
                  >
                    {formatAxis(tick)}
                  </SvgText>
                </React.Fragment>
              ))}

              {/* Bars, value labels and month labels */}
              {months.map((m, i) => {
                const groupX = plotLeft + i * groupWidth;
                const creditX = groupX + pairOffset;
                const debitX = creditX + barWidth + PAIR_GAP;
                const creditH = barHeight(m.credit);
                const debitH = barHeight(m.debit);
                const dimmed = selected !== null && selected !== i;
                const opacity = dimmed ? 0.35 : 1;

                return (
                  <React.Fragment key={m.full}>
                    <Path
                      d={topRoundedBar(creditX, baseline - creditH, barWidth, creditH, BAR_RADIUS)}
                      fill={m.credit > 0 ? CREDIT : CREDIT_CAP}
                      opacity={opacity}
                    />
                    <Path
                      d={topRoundedBar(debitX, baseline - debitH, barWidth, debitH, BAR_RADIUS)}
                      fill={m.debit > 0 ? DEBIT : DEBIT_CAP}
                      opacity={opacity}
                    />
                    <SvgText
                      x={creditX + barWidth / 2}
                      y={baseline - creditH - 5}
                      fontSize={9}
                      fontWeight="600"
                      fill={CREDIT_TEXT}
                      textAnchor="middle"
                      opacity={opacity}
                    >
                      {m.credit > 0 ? formatAxis(m.credit) : '₹0'}
                    </SvgText>
                    <SvgText
                      x={debitX + barWidth / 2}
                      y={baseline - debitH - 5}
                      fontSize={9}
                      fontWeight="600"
                      fill={DEBIT_TEXT}
                      textAnchor="middle"
                      opacity={opacity}
                    >
                      {m.debit > 0 ? formatAxis(m.debit) : '₹0'}
                    </SvgText>
                    <SvgText
                      x={groupX + groupWidth / 2}
                      y={baseline + 16}
                      fontSize={11}
                      fontWeight="600"
                      fill={selected === i ? TITLE : AXIS_TEXT}
                      textAnchor="middle"
                    >
                      {m.short}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* Touch targets, one per month group */}
            {months.map((m, i) => (
              <Pressable
                key={`hit-${m.full}`}
                onPress={() => toggle(i)}
                accessibilityRole="button"
                accessibilityLabel={`${m.full}: credit ${formatExact(m.credit)}, debit ${formatExact(m.debit)}`}
                style={[styles.hit, { left: plotLeft + i * groupWidth, width: groupWidth }]}
              />
            ))}

            {/* Floating tooltip for the selected month */}
            {active && (
              <View pointerEvents="none" style={[styles.tooltip, { left: tooltipLeft, width: TOOLTIP_WIDTH }]}>
                <Text style={styles.tooltipTitle}>{active.full}</Text>
                <View style={styles.tooltipRow}>
                  <View style={[styles.tooltipDot, { backgroundColor: CREDIT }]} />
                  <Text style={styles.tooltipLabel}>Credit</Text>
                  <Text style={[styles.tooltipValue, { color: '#6EE7B7' }]}>{formatExact(active.credit)}</Text>
                </View>
                <View style={styles.tooltipRow}>
                  <View style={[styles.tooltipDot, { backgroundColor: DEBIT }]} />
                  <Text style={styles.tooltipLabel}>Debit</Text>
                  <Text style={[styles.tooltipValue, { color: '#FCA5A5' }]}>{formatExact(active.debit)}</Text>
                </View>
                <View style={styles.tooltipDivider} />
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>Net Cash Flow</Text>
                  <Text style={[styles.tooltipValue, { color: net >= 0 ? '#6EE7B7' : '#FCA5A5' }]}>
                    {net >= 0 ? '+' : '-'}
                    {formatExact(Math.abs(net))}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      <Text style={styles.hint}>Tap a month to see details</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', color: TITLE },
  pills: { flexDirection: 'row', gap: 6 },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: '700' },
  chartArea: { width: '100%', height: CHART_HEIGHT },
  hit: {
    position: 'absolute',
    top: 0,
    height: CHART_HEIGHT,
  },
  tooltip: {
    position: 'absolute',
    top: 0,
    backgroundColor: TOOLTIP_BG,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 10,
    elevation: 6,
  },
  tooltipTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  tooltipDot: { width: 7, height: 7, borderRadius: 4 },
  tooltipLabel: { color: '#CBD5E1', fontSize: 11, flex: 1 },
  tooltipValue: { fontSize: 11, fontWeight: '700' },
  tooltipDivider: { height: 1, backgroundColor: '#334155', marginVertical: 6 },
  hint: { fontSize: 11, color: AXIS_TEXT, textAlign: 'center', marginTop: 6 },
});
