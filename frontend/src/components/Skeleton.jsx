import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      <div className="flex gap-2 pt-2 border-t border-gray-50">
        <div className="h-8 bg-gray-200 rounded-lg flex-1"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-10"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-10"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-50 border-b p-4 flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
        ))}
      </div>
      <div className="divide-y divide-gray-100 p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center py-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-7 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>

      {/* 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-between p-4 space-x-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="bg-gray-200 rounded-t w-full" style={{ height: `${20 + Math.random() * 60}%` }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lists skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-12 bg-gray-50 border border-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="space-y-6 max-w-4xl animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-12 bg-gray-50 border border-gray-100 rounded-lg"></div>
          <div className="h-12 bg-gray-50 border border-gray-100 rounded-lg"></div>
        </div>
      </div>

      {/* Full width box */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-50 border border-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
