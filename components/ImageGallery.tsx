
import React, { useState, useRef } from 'react';

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Threshold for a swipe to be registered (in pixels)
  const minSwipeDistance = 50;

  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };
  
  if (!images || images.length === 0) {
    return <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">לא נבחרו תמונות</div>;
  }

  return (
    <div 
      className="relative w-full h-full group touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="w-full h-full overflow-hidden">
        <img 
          src={images[currentIndex]} 
          alt={`Gallery image ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-all duration-500 ease-in-out select-none" 
          draggable="false"
        />
      </div>

      {/* Desktop Navigation Arrows - Visible only on md screens and up on hover */}
      <div className="hidden md:block">
        <button 
          onClick={goToPrevious}
          className="absolute top-1/2 -translate-y-1/2 right-4 z-30 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10"
          aria-label="הקודם"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button 
          onClick={goToNext}
          className="absolute top-1/2 -translate-y-1/2 left-4 z-30 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 border border-white/10"
          aria-label="הבא"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse z-20">
        {images.map((_, index) => (
            <div
                key={index}
                role="button"
                aria-label={`Go to image ${index + 1}`}
                className={`h-1.5 w-1.5 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === index ? 'bg-white scale-150 w-4' : 'bg-white/40 hover:bg-white'}`}
                onClick={() => setCurrentIndex(index)}
            ></div>
        ))}
      </div>
    </div>
  );
};
