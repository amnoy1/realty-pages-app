import React, { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
}

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-full">
      <div className="w-full h-full">
        <img src={images[currentIndex]} alt={`Gallery image ${currentIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" />
      </div>
      <button 
        onClick={goToPrevious} 
        className="absolute top-1/2 -translate-y-1/2 left-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors focus:outline-none z-10"
        aria-label="Previous Image"
      >
        <ChevronLeftIcon />
      </button>
      <button 
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors focus:outline-none z-10"
        aria-label="Next Image"
      >
        <ChevronRightIcon />
      </button>
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse z-10">
        {images.map((_, index) => (
            <div
                key={index}
                role="button"
                aria-label={`Go to image ${index + 1}`}
                className={`h-2 w-2 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === index ? 'bg-white scale-125' : 'bg-white/50'}`}
                onClick={() => setCurrentIndex(index)}
            ></div>
        ))}
      </div>
    </div>
  );
};
