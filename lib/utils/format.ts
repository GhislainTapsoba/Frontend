export function formatPrice(
  price: number,
  currency: string = 'XOF',
  locale: string = 'fr-FR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(
  dateString: string | Date,
  locale: string = 'fr-FR'
): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString(locale, options);
}
