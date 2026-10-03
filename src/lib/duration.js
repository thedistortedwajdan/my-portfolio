// Calendar months touched since "YYYY-MM", counting the start month and the current month (CV style).
export function monthsInclusive(since, now = new Date()) {
  const [year, month] = since.split('-').map(Number);
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month) + 1;
}

export function formatMonths(total) {
  if (!Number.isFinite(total) || total < 1) return '';
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years > 1 ? 'yrs' : 'yr'}`);
  if (months) parts.push(`${months} mo`);
  return parts.join(' ');
}

export function sinceLabel(since, now = new Date()) {
  return formatMonths(monthsInclusive(since, now));
}
