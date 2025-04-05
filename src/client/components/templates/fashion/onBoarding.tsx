"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

// Define types for our onboarding pages
interface OnboardingPage {
  mainImage: string;
  leftImage: string;
  rightImage: string;
  mainTitle: string;
  boldTitle: string;
  subtitle: string;
}

// Static onboarding data (similar to OnboardingStatic.pages in Flutter)
const onboardingPages: OnboardingPage[] = [
  {
    mainImage: "/images/main-clothing.jpg", // Replace with your image paths
    leftImage: "/images/left-clothing.jpg",
    rightImage: "/images/right-clothing.jpg",
    mainTitle: "Discover Seamless",
    boldTitle: "Shopping!",
    subtitle: "Fast Delivery, Easy Returns, And Endless Choices Await You",
  },
  {
    mainImage: "/images/main-clothing2.jpg",
    leftImage: "/images/left-clothing2.jpg",
    rightImage: "/images/right-clothing2.jpg",
    mainTitle: "Find Your Perfect",
    boldTitle: "Style!",
    subtitle: "Browse thousands of items from top fashion brands",
  },
  {
    mainImage: "/images/main-clothing3.jpg",
    leftImage: "/images/left-clothing3.jpg",
    rightImage: "/images/right-clothing3.jpg",
    mainTitle: "Shop On",
    boldTitle: "The Go!",
    subtitle: "Our mobile app makes shopping easy anywhere, anytime",
  },
];

// Props interfaces for our components
interface ShoppingBagIconProps {
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotationAngle: number;
}

// Background bag icon component
function ShoppingBagIcon({
  size,
  top,
  bottom,
  left,
  right,
  rotationAngle,
}: ShoppingBagIconProps) {
  return (
    <div
      className="absolute text-gray-800 opacity-10"
      style={{
        top,
        bottom,
        left,
        right,
        width: size,
        height: size,
        transform: `rotate(${rotationAngle}deg)`,
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1Zm-9-1a2 2 0 0 1 4 0v1h-4V6Zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10Z" />
      </svg>
    </div>
  );
}

interface CarouselImageProps {
  imagePath: string;
  width: string | number;
  height: string | number;
  isMain?: boolean;
}

// Carousel image component
function CarouselImage({
  imagePath,
  width,
  height,
  isMain = false,
}: CarouselImageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${isMain ? "shadow-lg" : ""}`}
      style={{ width, height }}
    >
      <div className="h-full w-full bg-gray-600">
        {/* Replace with your actual image paths */}
        <Image
          src="/api/placeholder/400/320"
          alt="Product"
          width={400}
          height={320}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

function OnBoardingPage(){
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);

  // Simulate image preloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoaded(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Handle navigation to next page
  const nextPage = (): void => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Navigate to login/signup page
      console.log("Navigate to login");
    }
  };

  // Navigate to login directly
  const goToLogin = (): void => {
    console.log("Navigate to login");
  };

  // Loading screen
  if (!imagesLoaded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
        <h2 className="mt-6 text-xl font-light">Getting ready...</h2>
      </div>
    );
  }

  const page = onboardingPages[currentPage];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
      {/* Background bag icons */}
      <ShoppingBagIcon
        size={110}
        top="20px"
        right="-40px"
        rotationAngle={-30}
      />
      <ShoppingBagIcon
        size={180}
        bottom="-50px"
        left="-80px"
        rotationAngle={15}
      />
      <ShoppingBagIcon
        size={130}
        bottom="300px"
        left="-50px"
        rotationAngle={30}
      />
      <ShoppingBagIcon
        size={150}
        bottom="100px"
        right="-55px"
        rotationAngle={-20}
      />
      <ShoppingBagIcon
        size={80}
        bottom="300px"
        right="-30px"
        rotationAngle={-18}
      />

      <div className="flex h-full flex-col pt-16">
        {/* Image carousel section */}
        <div className="relative mb-20 h-60">
          <div className="absolute left-[-4%]">
            <CarouselImage
              imagePath={page.leftImage}
              width="16vw"
              height="210px"
            />
          </div>

          <div className="absolute right-[-4%]">
            <CarouselImage
              imagePath={page.rightImage}
              width="16vw"
              height="210px"
            />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 transform">
            <CarouselImage
              imagePath={page.mainImage}
              width="80vw"
              height="230px"
              isMain={true}
            />
          </div>
        </div>

        {/* Text content and buttons */}
        <div className="px-6">
          <h2 className="text-center text-3xl font-light">{page.mainTitle}</h2>
          <h2 className="text-center text-3xl font-bold">{page.boldTitle}</h2>

          <p className="mt-4 text-center text-base text-gray-400">
            {page.subtitle}
          </p>

          <div className="mt-20">
            {/* Main action button */}
            <button
              onClick={nextPage}
              className="w-full rounded-full bg-white py-4 text-lg font-bold text-black"
            >
              {currentPage < onboardingPages.length - 1
                ? "Next"
                : "Get Started"}
            </button>

            {/* Sign in option */}
            <div className="mt-3 flex items-center justify-center">
              <span className="text-gray-500">Already have account?</span>
              <button onClick={goToLogin} className="ml-1 font-bold text-white">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="h-1 w-20 rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-white transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentPage + 1) / onboardingPages.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default OnBoardingPage;
