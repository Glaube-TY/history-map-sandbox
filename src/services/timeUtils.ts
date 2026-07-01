import dayjs from 'dayjs';

import type { ScenarioEvent } from '@/types/event';

export function formatScenarioDate(value: string): string {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY年M月D日') : value;
}

export function compareScenarioTime(left: string, right: string): number {
  const leftDate = dayjs(left);
  const rightDate = dayjs(right);

  if (leftDate.isValid() && rightDate.isValid()) {
    return leftDate.valueOf() - rightDate.valueOf();
  }

  if (leftDate.isValid()) {
    return -1;
  }

  if (rightDate.isValid()) {
    return 1;
  }

  return left.localeCompare(right);
}

export function compareScenarioEvent(left: ScenarioEvent, right: ScenarioEvent): number {
  if (left.sortOrder !== undefined && right.sortOrder !== undefined) {
    return left.sortOrder - right.sortOrder;
  }

  if (left.sortOrder !== undefined) {
    return -1;
  }

  if (right.sortOrder !== undefined) {
    return 1;
  }

  return compareScenarioTime(left.time, right.time);
}

export function formatEventTime(event: ScenarioEvent): string {
  if (event.displayTime) {
    return event.displayTime;
  }

  return formatScenarioDate(event.time);
}

export function formatScenarioRange(startDate: string, endDate: string): string {
  return `${formatScenarioDate(startDate)} - ${formatScenarioDate(endDate)}`;
}
