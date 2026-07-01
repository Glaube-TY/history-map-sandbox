import dayjs from 'dayjs';

export function formatScenarioDate(value: string): string {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY年M月D日') : value;
}

export function compareScenarioTime(left: string, right: string): number {
  return dayjs(left).valueOf() - dayjs(right).valueOf();
}

export function formatScenarioRange(startDate: string, endDate: string): string {
  return `${formatScenarioDate(startDate)} - ${formatScenarioDate(endDate)}`;
}
