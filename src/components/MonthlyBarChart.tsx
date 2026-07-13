import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLast6Months(): { year: number; month: number; label: string }[] {
  const now = new Date();
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()],
    });
  }
  return months;
}

function formatCompact(n: number): string {
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export default function MonthlyBarChart({ transactions }: Props) {
  const months = getLast6Months();

  const monthData = months.map(({ year, month, label }) => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthTxns = transactions.filter((t) => t.date.startsWith(prefix));
    const credit = monthTxns.filter((t) => t.direction === 'credit').reduce((s, t) => s + t.amount, 0);
    const debit = monthTxns.filter((t) => t.direction === 'debit').reduce((s, t) => s + t.amount, 0);
    return { label, credit, debit };
  });

  const maxValue = Math.max(...monthData.map((d) => Math.max(d.credit, d.debit)), 1);

  const chartWidth = 320;
  const chartHeight = 160;
  const barAreaHeight = 120;
  const groupWidth = chartWidth / 6;
  const barWidth = (groupWidth - 16) / 2;
  const bottomY = barAreaHeight + 8;

  return (
    <View style={styles.card}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.credit }]} />
          <Text style={styles.legendText}>Credit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.debit }]} />
          <Text style={styles.legendText}>Debit</Text>
        </View>
      </View>
      <Svg width="100%" height={chartHeight + 30} viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}>
        {monthData.map((d, i) => {
          const x = i * groupWidth + 8;
          const creditH = maxValue > 0 ? (d.credit / maxValue) * barAreaHeight : 0;
          const debitH = maxValue > 0 ? (d.debit / maxValue) * barAreaHeight : 0;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={bottomY - creditH}
                width={barWidth}
                height={Math.max(creditH, 2)}
                rx={4}
                fill={colors.credit}
                opacity={creditH > 0 ? 1 : 0.2}
              />
              <Rect
                x={x + barWidth + 2}
                y={bottomY - debitH}
                width={barWidth}
                height={Math.max(debitH, 2)}
                rx={4}
                fill={colors.debit}
                opacity={debitH > 0 ? 1 : 0.2}
              />
              {d.credit > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={bottomY - creditH - 4}
                  fontSize={9}
                  fill={colors.credit}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {formatCompact(d.credit)}
                </SvgText>
              )}
              {d.debit > 0 && (
                <SvgText
                  x={x + barWidth + 2 + barWidth / 2}
                  y={bottomY - debitH - 4}
                  fontSize={9}
                  fill={colors.debit}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {formatCompact(d.debit)}
                </SvgText>
              )}
              <SvgText
                x={x + barWidth + 1}
                y={bottomY + 16}
                fontSize={11}
                fill={colors.textSecondary}
                textAnchor="middle"
                fontWeight="600"
              >
                {d.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
});
