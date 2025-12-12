import { NoticeItem } from './types';

export const NOTICES: NoticeItem[] = [
  {
    id: 1,
    day: '10',
    yearMonth: '2025-12',
    title: '2025年12月19日至21日部分课程调整的通知',
    department: '教务处'
  },
  {
    id: 2,
    day: '10',
    yearMonth: '2025-12',
    title: '2025年12月19日至21日部分课程调整的通知',
    department: '研究生院'
  },
  {
    id: 3,
    day: '03',
    yearMonth: '2025-12',
    title: '2025年东华大学本科生优秀班导师名单公示',
    department: '学生处（研究生）工作部'
  },
  {
    id: 4,
    day: '17',
    yearMonth: '2025-11',
    title: '关于开展2025年度下半年延安路校区无偿献血活...',
    department: '后勤服务中心'
  },
  {
    id: 5,
    day: '05',
    yearMonth: '2025-11',
    title: '高性能纤维及制品教育部重点实验室 开放课题申...',
    department: '材料科学与工程学院'
  },
  {
    id: 6,
    day: '05',
    yearMonth: '2025-12',
    title: '第十六届“东华杯”电子商务“创新、创意、创...',
    department: '教务处'
  },
  {
    id: 7,
    day: '05',
    yearMonth: '2025-12',
    title: '2025年东华大学优秀博士生国际访学项目选拨结...',
    department: '研究生院'
  },
  {
    id: 8,
    day: '25',
    yearMonth: '2025-11',
    title: '关于推荐2025年东华大学比亚迪奖教金候选人的...',
    department: '学生处（研究生）工作部'
  },
  {
    id: 9,
    day: '09',
    yearMonth: '2025-10',
    title: '后勤服务中心2024年度安全文明先进集体及先进...',
    department: '后勤服务中心'
  },
  {
    id: 10,
    day: '09',
    yearMonth: '2025-10',
    title: '国家新材料现代产业学院拔尖人才实验班2025年...',
    department: '材料科学与工程学院'
  }
];

export const MOCK_CALENDAR_DAYS = [
  { day: 30, isCurrentMonth: false, lunar: '十一' },
  { day: 1, isCurrentMonth: true, lunar: '十二' },
  { day: 2, isCurrentMonth: true, lunar: '十三' },
  { day: 3, isCurrentMonth: true, lunar: '十四' },
  { day: 4, isCurrentMonth: true, lunar: '下午节' },
  { day: 5, isCurrentMonth: true, lunar: '十六' },
  { day: 6, isCurrentMonth: true, lunar: '十七' },
  { day: 7, isCurrentMonth: true, lunar: '十八' },
  { day: 8, isCurrentMonth: true, lunar: '十九' },
  { day: 9, isCurrentMonth: true, lunar: '二十' },
  { day: 10, isCurrentMonth: true, isToday: true, lunar: '廿一' },
  { day: 11, isCurrentMonth: true, lunar: '廿二' },
  { day: 12, isCurrentMonth: true, lunar: '廿三' },
  { day: 13, isCurrentMonth: true, lunar: '廿四' },
  { day: 14, isCurrentMonth: true, lunar: '廿五' },
  { day: 15, isCurrentMonth: true, lunar: '廿六' },
  { day: 16, isCurrentMonth: true, lunar: '廿七' },
  { day: 17, isCurrentMonth: true, lunar: '廿八' },
  { day: 18, isCurrentMonth: true, lunar: '廿九' },
  { day: 19, isCurrentMonth: true, lunar: '三十' },
  { day: 20, isCurrentMonth: true, lunar: '初一' },
  { day: 21, isCurrentMonth: true, lunar: '初二' },
  { day: 22, isCurrentMonth: true, lunar: '初三' },
  { day: 23, isCurrentMonth: true, lunar: '初四' },
  { day: 24, isCurrentMonth: true, lunar: '平安夜' },
  { day: 25, isCurrentMonth: true, lunar: '圣诞节' },
  { day: 26, isCurrentMonth: true, lunar: '初七' },
  { day: 27, isCurrentMonth: true, lunar: '初八' },
  { day: 28, isCurrentMonth: true, lunar: '初九' },
  { day: 29, isCurrentMonth: true, lunar: '初十' },
  { day: 30, isCurrentMonth: true, lunar: '十一' },
  { day: 31, isCurrentMonth: true, lunar: '十二' },
  { day: 1, isCurrentMonth: false, lunar: '元旦节', isHoliday: true, holidayName: '休' },
  { day: 2, isCurrentMonth: false, lunar: '十四', isHoliday: true, holidayName: '休' },
  { day: 3, isCurrentMonth: false, lunar: '十五', isHoliday: true, holidayName: '休' },
];
