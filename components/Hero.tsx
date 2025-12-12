import React from 'react';
import { Search } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative w-full h-[260px] bg-gray-200 overflow-hidden">
      {/* Background Image */}
      <img 
        src="https://picsum.photos/1920/400?grayscale&blur=2" 
        alt="Campus Scenery" 
        className="w-full h-full object-cover object-center"
      />
      {/* Red Overlay/Tint to match the slightly warm tone if needed, but keeping natural as per usual banner */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Search Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="relative w-full max-w-[600px] flex shadow-xl rounded-lg overflow-hidden">
           <input 
             type="text" 
             placeholder="请输入您想要搜索的内容" 
             className="flex-1 h-[50px] px-6 text-gray-700 text-sm outline-none placeholder-gray-400 bg-white/95 backdrop-blur-sm"
           />
           <button className="bg-dhu-red text-white px-8 h-[50px] flex items-center justify-center hover:bg-[#85021a] transition-colors font-medium text-base">
              搜索
           </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;