import React from 'react';
import Skeleton from '../Skeleton';

const InsightsSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* HEADER SKELETON */}
      <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <Skeleton variant="rect" className="w-10 h-10" />
          <Skeleton variant="text" className="w-48 h-6" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="rect" className="w-24 h-8 rounded-full" />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 md:pb-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* STATS GRID SKELETON */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-surface-1 border border-border-custom p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton variant="rect" className="w-12 h-12 rounded-2xl" />
                  <Skeleton variant="text" className="w-12 h-4" />
                </div>
                <Skeleton variant="text" className="w-24 h-10" />
                <Skeleton variant="text" className="w-full h-3" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CHART SKELETON */}
            <div className="md:col-span-2 bg-surface-1 border border-border-custom p-8 rounded-3xl space-y-8">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton variant="text" className="w-32 h-6" />
                  <Skeleton variant="text" className="w-48 h-3" />
                </div>
                <Skeleton variant="text" className="w-20 h-4" />
              </div>
              <div className="flex items-end justify-between gap-4 h-64 px-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <Skeleton key={i} variant="rect" className="w-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
              </div>
            </div>

            {/* GOALS SKELETON */}
            <div className="bg-surface-2 border border-border-custom p-8 rounded-3xl space-y-8">
              <Skeleton variant="text" className="w-32 h-6" />
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton variant="text" className="w-24 h-3" />
                      <Skeleton variant="text" className="w-8 h-3" />
                    </div>
                    <Skeleton variant="rect" className="w-full h-2 rounded-full" />
                  </div>
                ))}
              </div>
              <Skeleton variant="rect" className="w-full h-12 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InsightsSkeleton;
