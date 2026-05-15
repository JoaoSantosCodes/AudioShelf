import React from 'react';
import Skeleton from '../Skeleton';

const ShoppingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER SKELETON */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Skeleton variant="rect" className="w-10 h-10" />
          <Skeleton variant="text" className="w-32 h-6" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="text" className="w-20 h-4 hidden sm:block" />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 md:pb-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* AI SUGGESTIONS SKELETON */}
          <div className="space-y-4">
            <Skeleton variant="text" className="w-24 h-4 ml-2" />
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rect" className="w-40 h-16 shrink-0" />
              ))}
            </div>
          </div>

          {/* INPUT SKELETON */}
          <div className="bg-surface-1 border border-border-custom p-6 rounded-3xl space-y-4">
            <div className="flex gap-4">
              <Skeleton variant="rect" className="flex-1 h-16" />
              <Skeleton variant="rect" className="w-24 h-16 hidden sm:block" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant="rect" className="w-24 h-8" />
              ))}
            </div>
          </div>

          {/* LIST SKELETON */}
          <div className="space-y-4">
            <Skeleton variant="text" className="w-32 h-5" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-5 bg-surface-1/50 border border-border-custom rounded-3xl">
                <Skeleton variant="circle" className="w-6 h-6" />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="text" className="w-1/2 h-4" />
                  <Skeleton variant="text" className="w-1/4 h-2" />
                </div>
                <Skeleton variant="rect" className="w-8 h-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShoppingSkeleton;
