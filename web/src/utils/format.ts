export function formatCurrency(value: number | null, currency: string = 'INR'): string {
  if (value == null) {
    return 'N/A';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
