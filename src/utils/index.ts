const parsePrice = (priceStr: string): number => {
  return Number(priceStr.replace(/[^\d.-]/g, ''));
};

const formatToCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};

export { parsePrice, formatToCurrency };
