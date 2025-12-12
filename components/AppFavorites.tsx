import React from 'react';
import { 
  CircleDollarSign, 
  FlaskConical, 
  GraduationCap, 
  Flower2, 
  Cloud, 
  IdCard, 
  CalendarCheck, 
  Archive, 
  Globe, 
  Beaker,
  Bot
} from 'lucide-react';

const APPS = [
  { id: '1', name: '财务服务平台', icon: CircleDollarSign, bg: 'bg-red-50', text: 'text-red-500' },
  { id: '2', name: '低维设备仪器预约平台', icon: FlaskConical, bg: 'bg-orange-50', text: 'text-orange-500' },
  { id: '3', name: '学工系统', icon: GraduationCap, bg: 'bg-red-50', text: 'text-red-400' },
  { id: '4', name: '研究生系统', icon: Flower2, bg: 'bg-blue-50', text: 'text-blue-500' },
  { id: '5', name: '协同云', icon: Cloud, bg: 'bg-orange-50', text: 'text-orange-400' },
  { id: 'new-6', name: '校园助手', icon: Bot, bg: 'bg-red-100', text: 'text-dhu-red' },
  { id: '6', name: '个人账户管理', icon: IdCard, bg: 'bg-orange-50', text: 'text-orange-400' },
  { id: '7', name: '研究生选课考试', icon: CalendarCheck, bg: 'bg-orange-50', text: 'text-orange-500' },
  { id: '8', name: '档案投递', icon: Archive, bg: 'bg-orange-50', text: 'text-orange-500' },
  { id: '9', name: '研究生网站', icon: Globe, bg: 'bg-blue-50', text: 'text-blue-600' },
  { id: '10', name: '实验物资采购', icon: Beaker, bg: 'bg-orange-50', text: 'text-orange-400' },
];

interface AppFavoritesProps {
  onOpenAgent?: () => void;
}

const AppFavorites: React.FC<AppFavoritesProps> = ({ onOpenAgent }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border-t-4 border-dhu-red relative">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6 border-b border-gray-100 pb-2">
         <h3 className="font-bold text-lg text-gray-800 border-b-2 border-dhu-red pb-2 -mb-2.5">应用收藏</h3>
         <h3 className="font-bold text-lg text-gray-400 cursor-pointer hover:text-gray-600">网址收藏</h3>
         
         <button className="ml-auto text-sm text-dhu-red font-medium">编辑</button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-y-8 gap-x-4">
         {APPS.map((app) => (
             <div 
                key={app.id} 
                className="flex flex-col items-center justify-start text-center group cursor-pointer"
                onClick={() => {
                  if (app.id === 'new-6' && onOpenAgent) {
                    onOpenAgent();
                  }
                }}
             >
                <div className={`w-14 h-14 rounded-lg ${app.bg} ${app.text} flex items-center justify-center mb-3 transition-transform group-hover:scale-105 shadow-sm`}>
                   <app.icon size={28} strokeWidth={1.5} />
                </div>
                <span className="text-gray-700 text-xs font-medium max-w-[100px] leading-tight">
                    {app.name}
                </span>
             </div>
         ))}
      </div>
    </div>
  );
};

export default AppFavorites;