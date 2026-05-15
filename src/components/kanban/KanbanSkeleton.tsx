import React from 'react';
import Skeleton from '../Skeleton';

const KanbanSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      {/* HEADER SKELETON */}
      <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b border-border-custom glass-panel shrink-0 z-50">
        <div className="flex items-center gap-6">
          <Skeleton variant="rect" className="w-10 h-10" />
          <Skeleton variant="text" className="w-32 h-6 hidden xs:block" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="rect" className="w-24 h-10 rounded-xl" />
        </div>
      </header>

      {/* BOARD CONTENT SKELETON */}
      <main className="flex-1 overflow-x-auto no-scrollbar p-4 md:p-8 pb-32 md:pb-0">
        <div className="flex gap-4 md:gap-8 h-full min-w-[900px]">
          {[1, 2, 3].map((col) => (
            <div key={col} className="flex-1 min-w-[280px] bg-surface-1/30 rounded-[2rem] border border-border-custom/50 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-border-custom/50 bg-surface-2/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" className="w-6 h-6" />
                  <Skeleton variant="text" className="w-20 h-4" />
                </div>
                <Skeleton variant="rect" className="w-6 h-4 rounded-full" />
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((card) => (
                  <div key={card} className="p-5 bg-surface-2/50 border border-border-custom rounded-3xl space-y-3">
                    <div className="flex justify-between">
                      <Skeleton variant="rect" className="w-16 h-4" />
                      <Skeleton variant="circle" className="w-4 h-4" />
                    </div>
                    <Skeleton variant="text" className="w-full h-5" />
                    <Skeleton variant="text" className="w-3/4 h-3" />
                    <div className="flex justify-between pt-2">
                      <Skeleton variant="rect" className="w-20 h-4" />
                      <Skeleton variant="circle" className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default KanbanSkeleton;
