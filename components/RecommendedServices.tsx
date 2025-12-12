
import React from 'react';
import { 
  FileCheck, 
  Server, 
  Crosshair, 
  MonitorPlay, 
  UserCheck, 
  FlaskConical, 
  Bot 
} from 'lucide-react';

interface RecommendedServicesProps {
  onOpenAgent?: () => void;
}

const SERVICES = [
  { 
    id: '1', 
    name: '上海市“一网通办”平台验证', 
    visits: 636, 
    icon: FileCheck, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-50' 
  },
  { 
    id: '2', 
    name: '资产系统', 
    visits: 494363, 
    icon: Server, 
    color: 'text-green-600', 
    bg: 'bg-green-50' 
  },
  { 
    id: '3', 
    name: '教务系统', 
    visits: 10332460, 
    icon: Crosshair, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50' 
  },
  { 
    id: '4', 
    name: '科研系统', 
    visits: 142540, 
    icon: MonitorPlay, 
    color: 'text-red-600', 
    bg: 'bg-red-50' 
  },
  { 
    id: '5', 
    name: '企业微信绑定', 
    visits: 20790, 
    icon: UserCheck, 
    color: 'text-orange-500', 
    bg: 'bg-orange-50' 
  },
  { 
    id: '6', 
    name: '实验室智能管理', 
    visits: 30811, 
    icon: FlaskConical, 
    color: 'text-red-500', 
    bg: 'bg-red-50' 
  },
  { 
    id: 'agent', 
    name: '校园预约', 
    visits: 8888, 
    icon: Bot, 
    color: 'text-orange-600', 
    bg: 'bg-orange-100',
    isAgent: true
  },
];

const RecommendedServices: React.FC<RecommendedServicesProps> = ({ onOpenAgent }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border-t-4 border-dhu-red mt-4">
      {/* Header Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-gray-100">
         <h3 className="font-bold text-lg text-dhu-red border-b-2 border-dhu-red pb-3 px-1 cursor-pointer">推荐服务</h3>
         <h3 className="font-bold text-lg text-gray-800 pb-3 px-1 cursor-pointer hover:text-dhu-red transition-colors">热门服务</h3>
         <span className="ml-auto text-gray-500 text-sm cursor-pointer hover:text-dhu-red mb-2">更多</span>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4">
         {SERVICES.map((service) => (
             <div 
                key={service.id} 
                className="flex flex-col items-center justify-start text-center group cursor-pointer"
                onClick={() => {
                  if (service.isAgent && onOpenAgent) {
                    onOpenAgent();
                  }
                }}
             >
                <div className={`w-14 h-14 rounded-lg ${service.bg} ${service.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-105 shadow-sm`}>
                   <service.icon size={28} strokeWidth={1.5} />
                </div>
                <span className="text-gray-800 text-xs font-medium max-w-[120px] leading-tight mb-1">
                    {service.name}
                </span>
                <span className="text-gray-400 text-[10px] scale-90">
                    访问量: {service.visits}
                </span>
             </div>
         ))}
      </div>
    </div>
  );
};

export default RecommendedServices;
