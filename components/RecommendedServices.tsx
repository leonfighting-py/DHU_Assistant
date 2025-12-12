import React from 'react';
import { 
  Bot,
  FileCheck, 
  CircleDollarSign, 
  Monitor, 
  Crosshair, 
  GraduationCap, 
  FileCog, 
  HeartHandshake, 
  MonitorPlay, 
  Briefcase, 
  FlaskConical, 
  Copyright, 
  Luggage, 
  CalendarDays,
  MoreHorizontal
} from 'lucide-react';

interface RecommendedServicesProps {
  onTriggerIntent?: (intent: string) => void;
  onOpenAgent?: () => void;
}

const GRID_ITEMS = [
  { name: '校园助手', visits: 724, icon: Bot, color: 'text-dhu-red', bg: 'bg-red-100' },
  { name: '上海市“一网通办”平台验证', visits: 666, icon: FileCheck, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { name: '财务服务平台', visits: 1887831, icon: CircleDollarSign, color: 'text-dhu-red', bg: 'bg-red-100' },
  { name: '资产系统', visits: 496319, icon: Monitor, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { name: '教务系统', visits: 10336770, icon: Crosshair, color: 'text-blue-600', bg: 'bg-blue-100' },
  
  { name: '学工系统', visits: 1718945, icon: GraduationCap, color: 'text-red-400', bg: 'bg-red-50' },
  { name: '研究生管理 (教师用)', visits: 153590, icon: FileCog, color: 'text-red-500', bg: 'bg-red-50' },
  { name: '研究生系统', visits: 933970, icon: HeartHandshake, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: '科研系统', visits: 143943, icon: MonitorPlay, color: 'text-red-700', bg: 'bg-red-100' },
  { name: '企业微信绑定', visits: 20837, icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-100' },

  { name: '低维设备仪器预约平台', visits: 35423, icon: FlaskConical, color: 'text-orange-400', bg: 'bg-orange-50' },
  { name: '实验室智能管理', visits: 30926, icon: Monitor, color: 'text-red-400', bg: 'bg-red-50' },
  { name: '新知识产权', visits: 12422, icon: Copyright, color: 'text-red-600', bg: 'bg-red-100' },
  { name: '出差申请', visits: 66625, icon: Luggage, color: 'text-orange-500', bg: 'bg-orange-100' },
  { name: '人事系统', visits: 30754, icon: CalendarDays, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const RecommendedServices: React.FC<RecommendedServicesProps> = ({ onTriggerIntent }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm pt-0 pb-2 border-t-4 border-dhu-red mt-4 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-5 pt-4 mb-2">
         <div className="flex items-center gap-8">
            <h3 className="font-bold text-xl text-dhu-red border-b-[3px] border-dhu-red pb-2 cursor-pointer">推荐服务</h3>
            <h3 className="font-bold text-xl text-gray-700 pb-2 cursor-pointer hover:text-gray-900">热门服务</h3>
         </div>
         <span className="text-gray-500 text-sm cursor-pointer hover:text-dhu-red">更多</span>
      </div>
      
      <div className="h-px bg-gray-100 w-full mb-0"></div>

      {/* Grid Content */}
      <div className="grid grid-cols-5 divide-x divide-y divide-gray-100 border-b border-gray-100">
         {GRID_ITEMS.map((item, idx) => (
             <div 
                key={idx} 
                className="flex flex-col items-center justify-center text-center p-6 hover:bg-gray-50 cursor-pointer transition-colors h-[160px]"
                onClick={() => onTriggerIntent && onTriggerIntent(item.name)}
             >
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                   <item.icon size={26} strokeWidth={2} />
                </div>
                <span className="text-gray-800 text-sm font-medium leading-tight mb-2 px-1 line-clamp-2 h-10 flex items-center">
                    {item.name}
                </span>
                <span className="text-gray-400 text-[10px]">
                    访问量: {item.visits}
                </span>
             </div>
         ))}
      </div>
    </div>
  );
};

export default RecommendedServices;