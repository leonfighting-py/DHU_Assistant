import React from 'react';
import { User, MoreHorizontal } from 'lucide-react';

const UserProfile: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-5 shadow-sm mb-4">
      <div className="flex items-start mb-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-400 mr-4 shrink-0 overflow-hidden">
             <User className="w-10 h-10" fill="currentColor" />
        </div>
        
        <div className="flex-1 min-w-0">
           {/* Name placeholder - blurred in original */}
           <div className="h-6 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
           
           <div className="flex flex-wrap gap-2">
             <span className="bg-[#fdf6e7] text-[#d97706] text-xs px-2 py-0.5 rounded border border-[#faeacc]">
               研究生
             </span>
             <span className="bg-[#fce7f3] text-[#db2777] text-xs px-2 py-0.5 rounded border border-[#fbcfe8] truncate max-w-[120px]">
               材料科学与工程...
             </span>
           </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 ml-2">
           <button className="text-xs border border-dhu-red text-dhu-red px-3 py-1.5 rounded hover:bg-red-50 transition-colors">
             账号委托
           </button>
           <button className="text-xs border border-gray-600 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors">
             自助服务
           </button>
        </div>
      </div>

      {/* Status Grid */}
      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
          <div className="text-center flex-1 border-r border-gray-100 relative">
             <div className="text-dhu-red font-bold text-lg leading-tight">未绑定</div>
             <div className="text-gray-500 text-xs mt-1">我的邮箱</div>
             <button className="absolute top-0 right-1 text-gray-400">
               <MoreHorizontal size={14} />
             </button>
          </div>
          <div className="text-center flex-1 border-r border-gray-100">
             <div className="text-dhu-red font-bold text-lg leading-tight">10.68元</div>
             <div className="text-gray-500 text-xs mt-1">一卡通余额</div>
          </div>
          <div className="text-center flex-1">
             <div className="text-dhu-red font-bold text-lg leading-tight">0</div>
             <div className="text-gray-500 text-xs mt-1">待还图书</div>
          </div>
      </div>
    </div>
  );
};

export default UserProfile;