import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Transaction } from '../types';
import { formatINR } from './currency';

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}-${m}-${y}`;
}

function buildHtml(
  transactions: Transaction[],
  creditTotal: number,
  debitTotal: number,
  closingBalance: number,
  dateLabel: string
): string {
  const rows = transactions
    .map(
      (t) => `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td>${t.accountName}</td>
        <td style="color:#1B9E5A;">${t.direction === 'credit' ? formatINR(t.amount) : '-'}</td>
        <td style="color:#E04848;">${t.direction === 'debit' ? formatINR(t.amount) : '-'}</td>
        <td>${t.remarks || ''}</td>
      </tr>`
    )
    .join('');

  return `
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #1A1D21; }
        h1 { color: #2E7D5B; font-size: 22px; margin-bottom: 4px; }
        .subtitle { color: #8896A6; font-size: 13px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { background: #2E7D5B; color: #fff; padding: 8px 10px; text-align: left; }
        td { padding: 7px 10px; border-bottom: 1px solid #E5E9EF; }
        tr:nth-child(even) { background: #F5F7FA; }
        .totals { margin-top: 16px; display: flex; justify-content: space-between; }
        .totals div { padding: 10px 16px; border-radius: 8px; font-weight: 700; font-size: 14px; }
        .credit-total { background: #E6F9EF; color: #1B9E5A; }
        .debit-total { background: #FDE8E8; color: #E04848; }
        .closing { background: #2E7D5B; color: #fff; text-align: center; padding: 10px; border-radius: 8px; margin-top: 12px; font-weight: 700; font-size: 15px; }
        .footer { margin-top: 20px; font-size: 11px; color: #8896A6; text-align: center; }
      </style>
    </head>
    <body>
      <h1>Daily Expense Diary</h1>
      <div class="subtitle">${dateLabel} &bull; ${transactions.length} transactions</div>
      <table>
        <thead>
          <tr><th>Date</th><th>Name</th><th>Credit</th><th>Debit</th><th>Remarks</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <div class="credit-total">Credit: ${formatINR(creditTotal, 2)}</div>
        <div class="debit-total">Debit: ${formatINR(debitTotal, 2)}</div>
      </div>
      <div class="closing">Closing Balance: ${formatINR(closingBalance, 2)}</div>
      <div class="footer">Generated on ${new Date().toLocaleDateString('en-IN')}</div>
    </body>
    </html>
  `;
}

export async function exportPdf(
  transactions: Transaction[],
  creditTotal: number,
  debitTotal: number,
  closingBalance: number,
  dateLabel: string
): Promise<void> {
  const html = buildHtml(transactions, creditTotal, debitTotal, closingBalance, dateLabel);

  if (Platform.OS === 'web') {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const newUri = `${FileSystem.cacheDirectory}Daily_Expense_Diary.pdf`;
  await FileSystem.moveAsync({ from: uri, to: newUri });
  await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
}

export async function exportExcel(
  transactions: Transaction[],
  creditTotal: number,
  debitTotal: number,
  closingBalance: number,
  dateLabel: string
): Promise<void> {
  const data = transactions.map((t) => ({
    Date: formatDate(t.date),
    Name: t.accountName,
    Credit: t.direction === 'credit' ? t.amount : 0,
    Debit: t.direction === 'debit' ? t.amount : 0,
    Remarks: t.remarks || '',
  }));

  data.push({ Date: '', Name: '', Credit: 0, Debit: 0, Remarks: '' });
  data.push({ Date: '', Name: 'TOTAL', Credit: creditTotal, Debit: debitTotal, Remarks: '' });
  data.push({ Date: '', Name: 'Closing Balance', Credit: closingBalance, Debit: 0, Remarks: dateLabel });

  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, 'Daily_Expense_Diary.xlsx');
    return;
  }

  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const fileUri = `${FileSystem.cacheDirectory}Daily_Expense_Diary.xlsx`;
  await FileSystem.writeAsStringAsync(fileUri, wbout, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
