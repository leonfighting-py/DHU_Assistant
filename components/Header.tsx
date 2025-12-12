import React from 'react';
import { Search } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-dhu-red text-white shadow-md">
      <div className="max-w-[1240px] mx-auto px-4 h-[60px] flex items-center justify-between">
        {/* Left: Branding */}
        <div className="flex items-center gap-4">
           {/* 
              Logo: Using the official Donghua University logo (Crest + Calligraphy).
              Source: Wikimedia Commons (SVG supports transparency).
              Filter: 'brightness-0 invert' forces the red/black logo to be pure white.
           */}
           <img 
             src="图片1.png" 
             alt="东华大学 | Donghua University" 
             className="h-[42px] w-auto object-contain brightness-0 invert"
           />
           
           {/* Vertical Divider */}
           <div className="h-5 w-px bg-white/40"></div>
           
           {/* Portal Name */}
           <span className="text-[20px] tracking-widest font-light opacity-95 text-white whitespace-nowrap">
             网上服务大厅
           </span>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex space-x-8 text-[15px]">
          <a href="#" className="hover:text-white/80 font-medium border-b-2 border-transparent hover:border-white pb-1 transition-colors">首页</a>
          <a href="#" className="hover:text-white/80 font-medium border-b-2 border-transparent hover:border-white pb-1 transition-colors">应用中心</a>
          <a href="#" className="hover:text-white/80 font-medium border-b-2 border-transparent hover:border-white pb-1 transition-colors">事务中心</a>
          <a href="#" className="hover:text-white/80 font-medium border-b-2 border-transparent hover:border-white pb-1 transition-colors">数据中心</a>
        </nav>

        {/* Right: Search Icon */}
        <div className="flex items-center">
           <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search className="w-5 h-5" />
           </button>
        </div>
      </div>
    </header>
  );
};

export default Header;