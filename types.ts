import React from 'react';

export interface NoticeItem {
  id: number;
  day: string;
  yearMonth: string;
  title: string;
  department: string;
  isNew?: boolean;
}

export interface AppIcon {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color?: string;
}

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  isHoliday?: boolean;
  holidayName?: string;
  lunar: string;
}