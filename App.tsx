import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import UserProfile from './components/UserProfile';
import Tasks from './components/Tasks';
import CalendarWidget from './components/CalendarWidget';
import NoticeBoard from './components/NoticeBoard';
import AppFavorites from './components/AppFavorites';
import RecommendedServices from './components/RecommendedServices';
import AgentModal from './components/AgentModal';

function App() {
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [initialIntent, setInitialIntent] = useState<string | null>(null);

  const handleOpenAgent = (intent?: string) => {
    if (intent) {
      setInitialIntent(intent);
    }
    setIsAgentOpen(true);
  };

  const handleCloseAgent = () => {
    setIsAgentOpen(false);
    // Reset intent after close so it doesn't persist if opened via button next time
    setTimeout(() => {
      setInitialIntent(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-10 font-sans">
      <Header />
      <Hero />
      
      {/* Main Content Container */}
      <main className="max-w-[1240px] mx-auto px-4 -mt-8 relative z-20">
        <div className="flex flex-col lg:flex-row gap-5">
          
          {/* Left Column (Approx 30%) */}
          <div className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-4">
             <UserProfile />
             <Tasks />
             <div className="flex-1">
               <CalendarWidget />
             </div>
          </div>

          {/* Right Column (Remaining space) */}
          <div className="flex-1 flex flex-col gap-4">
             <NoticeBoard />
             <AppFavorites onOpenAgent={() => handleOpenAgent()} />
             <RecommendedServices onTriggerIntent={(text) => handleOpenAgent(text)} />
          </div>

        </div>
      </main>

      {/* Campus Event Co-pilot Modal */}
      <AgentModal 
        isOpen={isAgentOpen} 
        onClose={handleCloseAgent} 
        initialIntent={initialIntent}
      />
    </div>
  );
}

export default App;