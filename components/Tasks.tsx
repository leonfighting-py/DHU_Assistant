import React from 'react';
import { ClipboardList, FileText } from 'lucide-react';

const Tasks: React.FC = () => {
  return (
    <div className="flex gap-4 mb-4">
      {/* OA Pending */}
      <div className="bg-[#fff1f2] rounded-lg p-4 flex-1 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
         <div>
            <div className="text-gray-800 font-bold text-sm">OA待办 <span className="text-lg ml-1 font-extrabold">0</span></div>
            <div className="text-gray-800 font-bold text-sm mt-1">服务待办 <span className="text-lg ml-1 font-extrabold">0</span></div>
         </div>
         <div className="w-10 h-10 rounded-full bg-dhu-red/10 flex items-center justify-center text-dhu-red">
            <ClipboardList size={20} />
         </div>
      </div>

      {/* My Applications */}
      <div className="bg-[#fff1f2] rounded-lg p-4 flex-1 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow">
         <div>
            <div className="text-gray-800 font-bold text-sm">我的申请</div>
            <div className="text-gray-500 text-xs mt-2">发起的申请 <span className="text-black font-bold">0</span></div>
         </div>
         <div className="w-10 h-10 rounded-full bg-dhu-red/10 flex items-center justify-center text-dhu-red">
            <FileText size={20} />
         </div>
      </div>
    </div>
  );
};

export default Tasks;