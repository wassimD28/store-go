"use client";

import { useHomePageStore, Radius } from "../stores/home.store";
import { Search, Heart, Home, ShoppingBag, User } from "lucide-react";

function HomeScreen() {
  // Access the store values
  const { searchBar } = useHomePageStore();

  // Helper function to get border radius class based on radius value
  const getBorderRadiusClass = (radius: Radius) => {
    switch (radius) {
      case 'none': return '';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      default: return 'rounded-full';
    }
  };

  const searchBarRadiusClass = getBorderRadiusClass(searchBar.radius);



  

  return (
    <div className="relative flex h-full w-full flex-col bg-white pb-16">
      {/* Top user avatar and cart icon */}
      <div className="flex justify-between items-center px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
          <img src="/api/placeholder/32/32" alt="User avatar" />
        </div>
        <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center">
          <ShoppingBag size={16} />
        </div>
      </div>

      {/* Search bar - updated to match design */}
      <div className="px-4 mb-4">
        <div 
          className={`flex items-center w-full ${searchBarRadiusClass} px-2`}
          style={{ backgroundColor: searchBar.backgroundColor }}
        >
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchBar.placeholder || "Search"}
            style={{ 
              color: searchBar.textColor,
              backgroundColor: searchBar.backgroundColor
            }}
            className="w-full px-3 py-2.5 outline-none text-sm"
          />
        </div>
      </div>

      {/* Categories section - improved to match design */}
 

      {/* Bottom navigation - updated to match design */}
  
    </div>
  );
}

export default HomeScreen;