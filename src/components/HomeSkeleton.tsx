import React from 'react';
import Skeleton from './Skeleton';

const HomeSkeleton: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto no-scrollbar pb-32 md:pb-0">
      <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-border-custom bg-background/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Skeleton variant="rect" className="w-10 h-10 rounded-lg md:hidden" />
          <Skeleton variant="text" className="w-32 md:w-48 h-6" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="circle" className="w-8 h-8" />
          <Skeleton variant="circle" className="w-8 h-8" />
        </div>
      </header>

      <main className="p-4 md:p-8 space-y-6 md:space-y-10">
        {/* BRIEFING SKELETON */}
        <section className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] bg-surface-1 border border-border-custom min-h-[300px] flex flex-col justify-center">
          <div className="space-y-4 max-w-lg">
            <Skeleton variant="text" className="w-24 h-6" />
            <Skeleton variant="text" className="w-full h-12" />
            <Skeleton variant="text" className="w-3/4 h-4" />
            <div className="flex flex-wrap gap-4 pt-4">
              <Skeleton variant="rect" className="w-32 h-12" />
              <Skeleton variant="rect" className="w-32 h-12" />
            </div>
          </div>
        </section>

        {/* STATS GRID SKELETON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rect" className="h-40 rounded-[2.5rem]" />
          ))}
        </div>

        {/* COLLECTION SKELETON */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-32 h-6" />
            <div className="flex gap-2">
              <Skeleton variant="rect" className="w-20 h-8" />
              <Skeleton variant="rect" className="w-20 h-8" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <Skeleton key={i} variant="rect" className="aspect-[2/3]" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeSkeleton;
