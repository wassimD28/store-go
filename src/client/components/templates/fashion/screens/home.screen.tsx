"use client";

import { useHomePageStore, Radius } from "../stores/home.store";
import { Search, Heart, Home, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function HomeScreen() {
  // Access the store values
  const { searchBar } = useHomePageStore();
  const [activeNavItem, setActiveNavItem] = useState("Home");

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

  const handleNavItemClick = (itemName: string) => {
    setActiveNavItem(itemName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top header with avatar and cart */}
      <header className="flex justify-between items-center p-4">
        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden relative">
          <Image 
            src="/images/profile.png"
            alt="User avatar"
            fill
            sizes="32px"
            className="object-cover"
          />
        </div>
        <button className="p-2">
          <ShoppingBag size={20} />
        </button>
      </header>
      
      {/* Search bar section */}
      <div className="px-4 mb-4">
        <div 
          className={`flex items-center gap-2 px-4 py-2 ${searchBarRadiusClass}`}
          style={{ backgroundColor: searchBar.backgroundColor }}
        >
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder={searchBar.placeholder}
            className="bg-transparent w-full outline-none text-sm"
            style={{ color: searchBar.textColor }}
          />
        </div>
      </div>
      
      {/* Categories section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-sm text-black">Categories</h2>
          <a href="#" className="text-sm text-gray-500">See All</a>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-1 relative">
              <Image src="/images/categories/category_hoodies.png" alt="Hoodies" width={45} height={45} />
            </div>
            <span className="text-xs text-black">Hoodies</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1 relative">
              <Image src="/images/categories/category_shorts.png" alt="Shorts" width={45} height={45} />
            </div>
            <span className="text-xs text-black">Shorts</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1 relative">
              <Image src="/images/categories/category_shoes.png" alt="Shoes" width={45} height={45} />
            </div>
            <span className="text-xs text-black">Shoes</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-1 relative">
              <Image src="/images/categories/category_bag.png" alt="Bag" width={45} height={45} />
            </div>
            <span className="text-xs text-black">Bag</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-1 relative">
              <Image src="/images/categories/category_accessories.png" alt="Accessories" width={45} height={45} />
            </div>
            <span className="text-xs text-black">Accessories</span>
          </div>
        </div>
      </div>
      
      {/* Top Selling section */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-sm text-black">Top Selling</h2>
          <a href="#" className="text-sm text-gray-500">See All</a>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="product-card">
            <div className="relative mb-2 h-40">
              <Image 
                src="/images/products/product_jacket.png" 
                alt="Green jacket" 
                fill
                sizes="(max-width: 768px) 50vw, 160px"
                className="object-cover rounded-lg"
              />
              <button className="absolute top-2 right-2 bg-white p-1 rounded-full">
                <Heart size={16} />
              </button>
            </div>
            <h3 className="text-xs font-medium text-black">Men&apos;s Harrington Jacket</h3>
            <p className="text-xs font-bold text-black">$148.00</p>
          </div>
          <div className="product-card">
            <div className="relative mb-2 h-40">
              <Image 
                src="/images/products/product_slides.png" 
                alt="Slippers" 
                fill
                sizes="(max-width: 768px) 50vw, 160px"
                className="object-cover rounded-lg"
              />
              <button className="absolute top-2 right-2 bg-white p-1 rounded-full">
                <Heart size={16} />
              </button>
            </div>
            <h3 className="text-xs font-medium text-black">Max Men&apos;s Slides</h3>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-black">$95.00</p>
              <p className="text-xs text-gray-400 line-through">$100.07</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* New In section */}
      <div className="px-4 mb-16">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium text-sm text-black">New In</h2>
          <a href="#" className="text-sm text-gray-500">See All</a>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="product-card">
            <div className="relative mb-2 h-40">
              <Image 
                src="/api/placeholder/160/200" 
                alt="Green shirt" 
                fill
                sizes="(max-width: 768px) 50vw, 160px"
                className="object-cover rounded-lg"
              />
              <button className="absolute top-2 right-2 bg-white p-1 rounded-full">
                <Heart size={16} />
              </button>
            </div>
          </div>
          <div className="product-card">
            <div className="relative mb-2 h-40">
              <Image 
                src="/api/placeholder/160/200" 
                alt="Person with afro" 
                fill
                sizes="(max-width: 768px) 50vw, 160px"
                className="object-cover rounded-lg"
              />
              <button className="absolute top-2 right-2 bg-white p-1 rounded-full">
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
{/* Bottom navigation */}
<div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 py-3 px-6">
  <div className="flex justify-between items-center">
    <button 
      className="flex items-center gap-1"
      onClick={() => handleNavItemClick("Home")}
    >
      <div className={`p-2 rounded-full ${activeNavItem === "Home" ? 'bg-black' : 'bg-transparent'}`}>
        <Image 
          src="/svg/home.svg" 
          alt="Home" 
          width={20} 
          height={20}
          className={activeNavItem === "Home" ? "filter-white" : ""} 
          style={{ filter: activeNavItem !== "Home" ? "invert(60%)" : "" }}
        />
      </div>
      {activeNavItem === "Home" && (
        <span className="text-xs text-black font-medium">
          Home
        </span>
      )}
    </button>
    
    <button 
      className="flex items-center gap-1"
      onClick={() => handleNavItemClick("Wishlist")}
    >
      <div className={`p-2 rounded-full ${activeNavItem === "Wishlist" ? 'bg-black' : 'bg-transparent'}`}>
        <Image 
          src="/svg/Heart.svg" 
          alt="Heart" 
          width={20} 
          height={20}
          className={activeNavItem === "Wishlist" ? "filter-white" : ""} 
          style={{ filter: activeNavItem !== "Wishlist" ? "invert(60%)" : "" }}
        />
      </div>
      {activeNavItem === "Wishlist" && (
        <span className="text-xs text-black font-medium">
          Wishlist
        </span>
      )}
    </button>
    
    <button 
      className="flex items-center gap-1"
      onClick={() => handleNavItemClick("Cart")}
    >
      <div className={`p-2 rounded-full ${activeNavItem === "Cart" ? 'bg-black' : 'bg-transparent'}`}>
        <Image 
          src="/svg/bag2.svg" 
          alt="Shopping Bag" 
          width={20} 
          height={20}
          className={activeNavItem === "Cart" ? "filter-white" : ""} 
          style={{ filter: activeNavItem !== "Cart" ? "invert(60%)" : "" }}
        />
      </div>
      {activeNavItem === "Cart" && (
        <span className="text-xs text-black font-medium">
          Cart
        </span>
      )}
    </button>
    
    <button 
      className="flex items-center gap-1"
      onClick={() => handleNavItemClick("Profile")}
    >
      <div className={`p-2 rounded-full ${activeNavItem === "Profile" ? 'bg-black' : 'bg-transparent'}`}>
        <Image 
          src="/svg/profile.svg" 
          alt="User Profile" 
          width={20} 
          height={20}
          className={activeNavItem === "Profile" ? "filter-white" : ""} 
          style={{ filter: activeNavItem !== "Profile" ? "invert(60%)" : "" }}
        />
      </div>
      {activeNavItem === "Profile" && (
        <span className="text-xs text-black font-medium">
          Profile
        </span>
      )}
    </button>
  </div>
</div>
    </div>
  );
}

export default HomeScreen;


