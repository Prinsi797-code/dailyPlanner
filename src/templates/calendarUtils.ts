export function getMonthMatrix(year: number, month: number, startDay: 'mon' | 'sun' = 'mon'): (number | null)[][] {
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const totalDays = lastDate.getDate();

  let firstWeekday = firstDate.getDay(); // 0 = Sunday
  if (startDay === 'mon') {
    firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;
  }

  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = new Array(firstWeekday).fill(null);

  for (let day = 1; day <= totalDays; day++) {
    week.push(day);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAYS_MON_START = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const DAYS_SUN_START = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];