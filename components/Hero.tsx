import React from 'react';

const Hero: React.FC = () => {
  // Using an image proxy to bypass potential hotlink protection (403) from the original university server
  // This ensures the sunset panoramic photo renders correctly.
  const HERO_IMAGE = "27cc566e-c150-4cb7-ad22-df0064a174e1.jpg";

  return (
    <div className="relative w-full h-[260px] bg-gray-200 overflow-hidden group">
      {/* Background Image - Donghua University Songjiang Campus Library at Sunset */}
      <img 
        src={HERO_IMAGE}
        alt="Donghua University Library Campus Scenery" 
        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        onError={(e) => {
          // Fallback if proxy fails
          e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Donghua_Univ_Songjiang_Campus.jpg/2560px-Donghua_Univ_Songjiang_Campus.jpg";
        }}
      />
      {/* Overlay for text contrast */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Search Container */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <div className="relative w-full max-w-[600px] flex shadow-2xl rounded-lg overflow-hidden transform transition-all hover:scale-[1.01]">
           <input 
             type="text" 
             placeholder="请输入您想要搜索的内容" 
             className="flex-1 h-[54px] px-6 text-gray-800 text-sm outline-none placeholder-gray-500 bg-white/95 backdrop-blur-md border-none"
           />
           <button className="bg-dhu-red text-white px-9 h-[54px] flex items-center justify-center hover:bg-[#85021a] transition-colors font-bold text-base tracking-wide">
              搜索
           </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;