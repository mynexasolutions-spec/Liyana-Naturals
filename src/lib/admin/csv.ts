// Builds and downloads a spreadsheet file in the browser.

function cell(value: string | number): string {
  let text = String(value);
  // Spreadsheets run cells that start with these characters as formulas, and
  // visitors type their own names, addresses and emails.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(cell).join(",")).join("\r\n");
  // The leading mark tells Excel the file is UTF-8.
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
