import React, { useState } from 'react';
// import Image from 'next/image'; // Replaced with standard <img> for preview compatibility

interface ImageGalleryProps {
  images: string[];
}

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
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
    return <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">לא נבחרו תמונות</div>;
  }

  return (
    <div className="relative w-full h-full group">
      <div className="w-full h-full">
        {/* Replaced standard Next.js Image with regular img tag for preview compatibility */}
        <img 
          src={images[currentIndex]} 
          alt={`Gallery image ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-500 ease-in-out" 
        />
      </div>
      <button 
        onClick={goToPrevious} 
        className="absolute top-1/2 -translate-y-1/2 left-4 bg-black/40 text-white p-3 rounded-full hover:bg-black/70 transition-all focus:outline-none z-20 opacity-70 hover:opacity-100"
        aria-label="Previous Image"
      >
        <ChevronLeftIcon />
      </button>
      <button 
        onClick={goToNext}
        className="absolute top-1/2 -translate-y-1/2 right-4 bg-black/40 text-white p-3 rounded-full hover:bg-black/70 transition-all focus:outline-none z-20 opacity-70 hover:opacity-100"
        aria-label="Next Image"
      >
        <ChevronRightIcon />
      </button>
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse z-20">
        {images.map((_, index) => (
            <div
                key={index}
                role="button"
                aria-label={`Go to image ${index + 1}`}
                className={`h-2 w-2 rounded-full cursor-pointer transition-all duration-300 ${currentIndex === index ? 'bg-white scale-150 w-6' : 'bg-white/60 hover:bg-white'}`}
                onClick={() => setCurrentIndex(index)}
            ></div>
        ))}
      </div>
    </div>
  );
};