import { create } from "zustand";

// Define the radius type to match the expected values
export type Radius = "none" | "sm" | "md" | "lg" | "full";

// Interface for the search bar
interface SearchBarElement {
  placeholder: string;
  backgroundColor: string;
  textColor: string;
  radius: Radius;
}

interface HomePageStore {
  searchBar: SearchBarElement;
  updateSearchBar: (searchBar: Partial<SearchBarElement>) => void;
}

export const useHomePageStore = create<HomePageStore>((set) => ({
  // Initialize with default values that match the design
  searchBar: {
    placeholder: "Search",
    backgroundColor: "#F5F5F5", // Light gray search bar background
    textColor: "#000000", // Black text for search
    radius: "full", // Completely rounded corners
  },
  
  updateSearchBar: (searchBar) =>
    set((state) => ({
      searchBar: { ...state.searchBar, ...searchBar },
    })),
}));