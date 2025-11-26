import React from 'react';
import Card from '../card';

const BlogSkeleton = ({ type = 'list', count = 6 }) => {
  if (type === 'hero') {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Featured Skeleton */}
          <div className="lg:col-span-2">
            <Card extra="overflow-hidden">
              <div className="relative">
                <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex space-x-3 mb-3">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20 animate-pulse"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-24 animate-pulse"></div>
                  </div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-3 animate-pulse"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4 animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar Skeletons */}
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} extra="overflow-hidden">
                <div className="flex">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0"></div>
                  <div className="p-4 flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className="space-y-6">
        {/* Search Skeleton */}
        <Card extra="p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-32 animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </Card>

        {/* Recent Posts Skeleton */}
        <Card extra="p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-36 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Categories Skeleton */}
        <Card extra="p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-24 animate-pulse"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-8 animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Default list skeleton
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} extra="overflow-hidden">
          <div className="relative">
            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="absolute top-3 left-3">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
            
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
            </div>
            
            <div className="flex space-x-2 mb-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-16 animate-pulse"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-20 animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Blog Loading Component
export const BlogLoading = ({ type = 'full' }) => {
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Skeleton */}
        <div className="text-center py-12">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
        </div>

        {type === 'full' && <BlogSkeleton type="hero" />}

        {/* Category Filter Skeleton */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full w-32 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <BlogSkeleton type="list" count={6} />
          </div>
          <div className="lg:col-span-1">
            <BlogSkeleton type="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;