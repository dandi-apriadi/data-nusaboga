export const formatIDRCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(amount || 0));

export const formatDateID = (date, options = {}) => {
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit', ...options });
  } catch {
    return '-';
  }
};
