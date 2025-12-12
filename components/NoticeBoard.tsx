import React from 'react';
import { Mail, FolderOpen, PlusSquare } from 'lucide-react';
import { NOTICES } from '../constants';

const NoticeBoard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-4">
       {/* Tabs Header */}
       <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-gray-800 border-r border-gray-300 pr-6 cursor-pointer">
                <Mail className="text-dhu-red" size={20} />
                <span className="font-bold text-lg">通知公告</span>
             </div>
             <div className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                <FolderOpen size={20} />
                <span className="font-medium text-lg">东华要闻</span>
             </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm cursor-pointer hover:text-dhu-red">
             <PlusSquare size={16} className="text-dhu-red" />
             <span>订阅管理</span>
          </div>
       </div>

       {/* List Content - Two Columns */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {NOTICES.map((notice) => (
             <div key={notice.id} className="flex gap-3 items-start group cursor-pointer">
                {/* Date Box */}
                <div className="flex-shrink-0 w-12 h-12 border border-dhu-red rounded overflow-hidden flex flex-col text-center">
                   <div className="flex-1 flex items-center justify-center font-bold text-xl text-dhu-red bg-white">
                      {notice.day}
                   </div>
                   <div className="h-4 bg-dhu-red text-white text-[10px] flex items-center justify-center">
                      {notice.yearMonth}
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                   <h4 className="text-gray-800 text-sm font-medium mb-1 truncate group-hover:text-dhu-red transition-colors">
                      {notice.title}
                   </h4>
                   <div className="text-xs text-gray-400">
                      站点: {notice.department}
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};

export default NoticeBoard;