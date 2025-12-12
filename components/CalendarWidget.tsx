import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const CalendarWidget: React.FC = () => {
  // Hardcoded to match Fig 2 exactly (Dec 2025)
  // 30 Nov - 3 Jan layout
  const CALENDAR_DAYS = [
    { day: 30, lunar: '十一', isCurrent: false },
    { day: 1, lunar: '十二', isCurrent: true },
    { day: 2, lunar: '十三', isCurrent: true },
    { day: 3, lunar: '十四', isCurrent: true },
    { day: 4, lunar: '下元节', isCurrent: true }, // Screenshot says 下元节 roughly here or similar
    { day: 5, lunar: '十六', isCurrent: true },
    { day: 6, lunar: '十七', isCurrent: true },
    
    { day: 7, lunar: '十八', isCurrent: true },
    { day: 8, lunar: '十九', isCurrent: true },
    { day: 9, lunar: '二十', isCurrent: true },
    { day: 10, lunar: '廿一', isCurrent: true },
    { day: 11, lunar: '廿二', isCurrent: true },
    { day: 12, lunar: '廿三', isCurrent: true, isSelected: true }, // The highlighted day
    { day: 13, lunar: '廿四', isCurrent: true },
    
    { day: 14, lunar: '廿五', isCurrent: true },
    { day: 15, lunar: '廿六', isCurrent: true },
    { day: 16, lunar: '廿七', isCurrent: true },
    { day: 17, lunar: '廿八', isCurrent: true },
    { day: 18, lunar: '廿九', isCurrent: true },
    { day: 19, lunar: '三十', isCurrent: true },
    { day: 20, lunar: '初一', isCurrent: true },
    
    { day: 21, lunar: '初二', isCurrent: true },
    { day: 22, lunar: '初三', isCurrent: true },
    { day: 23, lunar: '初四', isCurrent: true },
    { day: 24, lunar: '平安夜', isCurrent: true },
    { day: 25, lunar: '圣诞节', isCurrent: true },
    { day: 26, lunar: '初七', isCurrent: true },
    { day: 27, lunar: '初八', isCurrent: true },
    
    { day: 28, lunar: '初九', isCurrent: true },
    { day: 29, lunar: '初十', isCurrent: true },
    { day: 30, lunar: '十一', isCurrent: true },
    { day: 31, lunar: '十二', isCurrent: true },
    { day: 1, lunar: '元旦节', isCurrent: false },
    { day: 2, lunar: '十四', isCurrent: false },
    { day: 3, lunar: '十五', isCurrent: false },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 relative h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-gray-800 text-xl tracking-wide">我的日程</h3>
        <div className="flex items-center gap-3">
           <div className="bg-red-50 text-dhu-red border border-red-100 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
             第14周
           </div>
           <button className="text-gray-500 text-sm hover:text-dhu-red font-medium">更多</button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-red-50/50 rounded-lg p-2 mb-2">
          <div className="flex items-center justify-between px-2">
              <button className="text-gray-400 hover:text-gray-600 p-1"><ChevronLeft size={20} strokeWidth={3} /></button>
              <h4 className="font-bold text-xl text-gray-800 tracking-tight">2025年12月</h4>
              <button className="text-gray-400 hover:text-gray-600 p-1"><ChevronRight size={20} strokeWidth={3} /></button>
          </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
          {/* Weekday Header */}
          <div className="grid grid-cols-7 text-center mb-4 mt-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
                <div key={d} className="text-gray-500 text-base font-medium">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 text-center gap-y-3 gap-x-1">
             {CALENDAR_DAYS.map((day, idx) => (
                 <div key={idx} className="flex flex-col items-center justify-start h-14 relative group cursor-pointer">
                    <div className={`
                        w-10 h-10 flex flex-col items-center justify-center rounded-xl transition-all
                        ${day.isSelected ? 'bg-dhu-red text-white shadow-md scale-110' : 'hover:bg-gray-100 text-gray-700'}
                        ${!day.isCurrent && !day.isSelected ? 'opacity-30' : ''}
                    `}>
                        <span className={`text-lg font-bold leading-none mb-0.5 ${!day.isCurrent && !day.isSelected ? 'text-gray-400' : ''}`}>
                            {day.day}
                        </span>
                        <span className={`text-[9px] leading-none transform ${day.isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                            {day.lunar}
                        </span>
                    </div>
                 </div>
             ))}
          </div>
      </div>
    </div>
  );
};

export default CalendarWidget;