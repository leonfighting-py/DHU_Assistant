import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MOCK_CALENDAR_DAYS } from '../constants';

const CalendarWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800 text-lg">我的日程</h3>
            <span className="text-xs text-gray-400">课表日程温馨提示 <span className="border border-gray-400 rounded-full w-3 h-3 inline-flex items-center justify-center text-[10px]">i</span></span>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-gray-100 text-dhu-red px-3 py-1 rounded text-xs font-bold">第14周</div>
           <button className="text-gray-500 text-sm hover:text-dhu-red">订阅</button>
           <button className="text-gray-500 text-sm hover:text-dhu-red">更多</button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 mb-4">
          <button className="text-gray-400 hover:text-gray-700"><ChevronLeft size={20} /></button>
          <h4 className="font-bold text-lg text-gray-800">2025年12月</h4>
          <button className="text-gray-400 hover:text-gray-700"><ChevronRight size={20} /></button>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 text-center mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <div key={d} className="text-gray-500 text-sm font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 text-center gap-y-2">
         {MOCK_CALENDAR_DAYS.map((day, idx) => (
             <div key={idx} className={`flex flex-col items-center justify-start h-12 py-1 rounded-lg relative ${day.isToday ? 'bg-dhu-red text-white shadow-md' : 'hover:bg-gray-50'}`}>
                <span className={`text-base font-medium leading-none mb-1 ${!day.isCurrentMonth ? 'text-gray-300' : ''}`}>
                    {day.day}
                </span>
                <span className={`text-[10px] leading-none transform scale-90 ${day.isToday ? 'text-white' : 'text-gray-400'}`}>
                    {day.lunar}
                </span>
                
                {/* Holiday Badge */}
                {day.isHoliday && (
                    <span className="absolute top-0 right-0 bg-green-500 text-white text-[8px] px-0.5 rounded-sm">
                        {day.holidayName}
                    </span>
                )}
             </div>
         ))}
      </div>

      {/* Bottom Status */}
      <div className="mt-6">
         <h3 className="font-bold text-gray-800 mb-2">您今日没有日程</h3>
      </div>

       {/* Floating Action Button */}
       <button className="absolute bottom-4 right-4 bg-dhu-red text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-[#85021a] transition-colors">
          <Plus size={24} />
       </button>
    </div>
  );
};

export default CalendarWidget;