import React from 'react';
import Skeleton from '../Skeleton';

const AgendaSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER SKELETON */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Skeleton variant="rect" className="w-10 h-10" />
          <Skeleton variant="text" className="w-32 h-6" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="rect" className="w-24 h-10 rounded-xl" />
          <Skeleton variant="circle" className="w-8 h-8" />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 md:pb-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* DAY SELECTOR SKELETON */}
          <div className="flex gap-2 overflow-hidden pb-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} variant="rect" className="w-20 h-24 rounded-2xl shrink-0" />
            ))}
          </div>

          {/* AGENDA GRID SKELETON */}
          <div className="bg-surface-1 border border-border-custom rounded-[2.5rem] p-6 md:p-8 space-y-8">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" className="w-48 h-6" />
              <Skeleton variant="rect" className="w-32 h-10 rounded-xl" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-5 bg-surface-2/50 border border-border-custom rounded-3xl">
                  <Skeleton variant="rect" className="w-16 h-4" />
                  <div className="w-px h-8 bg-border-custom" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-1/3 h-4" />
                    <Skeleton variant="text" className="w-1/4 h-2" />
                  </div>
                  <Skeleton variant="circle" className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgendaSkeleton;
