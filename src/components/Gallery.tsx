import React, { useState } from 'react';
import { Camera, Play, Image as ImageIcon, ChevronRight, X, ChevronLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryProps {
  isFullPage?: boolean;
}

export default function Gallery({ isFullPage = false }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const images = [
    { url: 'https://i.ibb.co/4g3QbFJ7/Whats-App-Image-2026-03-15-at-15-56-19-1.jpg', title: 'Banner' },
    { url: 'https://i.ibb.co/Swmz6y4B/Whats-App-Image-2026-03-15-at-15-56-27.jpg', title: 'Buffet' },
    { url: 'https://i.ibb.co/hJ59pNkm/56ryhg5r6.jpg', title: 'Area Coverage' },
    { url: 'https://i.ibb.co/ZR4Xn6Gz/34r5t3.jpg', title: 'Tent' },
    { url: 'https://i.ibb.co/b55LYGC3/4e5rft3r.jpg', title: 'Thali' },
    { url: 'https://i.ibb.co/rfqxt3Sr/werdfewa3.jpg', title: 'Customer attraction' },
    { url: 'https://i.ibb.co/GvCjkz9V/ew3fdrw3r3.jpg', title: 'Sweets' },
    { url: 'https://i.ibb.co/TMdrsHqv/frfe3f.jpg', title: 'Mithilanchal Tarua' },
    { url: 'https://i.ibb.co/99wYYcMX/ftg3rf.jpg', title: 'Complete Meals' },
    { url: 'https://i.ibb.co/gMzh6B73/khbikuuk.jpg', title: 'A-Z Arrangement' },
    { url: 'https://i.ibb.co/wrC6tpkv/Whats-App-Image-2026-03-15-at-15-56-25.jpg', title: 'Tent Setup' },
    { url: 'https://i.ibb.co/ZRy4P4R2/Whats-App-Image-2026-03-15-at-15-56-26-1-iug.jpg', title: 'High-Trained Staffs' },
    { url: 'https://i.ibb.co/Swmz6y4B/Whats-App-Image-2026-03-15-at-15-56-27.jpg', title: 'Sufficient Quantity & Quality' },
    { url: 'https://i.ibb.co/h1VHzq8C/Whats-App-Image-2026-03-15-at-15-56-2734r5.jpg', title: 'Breakfast' },
    { url: 'https://i.ibb.co/gFHgW79s/Whats-App-Image-2026-03-15-at-15-59-23.jpg', title: 'Buffet Arrangement' },
    { url: 'https://i.ibb.co/Mx3WgJPr/Whats-App-Image-2026-03-15-at-16-00-25.jpg', title: 'Haldi' },
    { url: 'https://i.ibb.co/LXW20NxN/Whats-App-Image-2026-03-15-at-16-00-2534rfd34.jpg', title: 'Mehndi' },
  ];

  const displayedImages = isFullPage ? images : images.slice(0, 2);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  return (
    <section id="gallery" className={`py-20 ${isFullPage ? 'bg-blood min-h-screen' : 'bg-black/10 backdrop-blur-sm'}`}>
      <div className="container mx-auto px-4">
        {isFullPage && (
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold mb-8 transition-colors group"
          >
            <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </motion.a>
        )}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 text-white`}>
              {isFullPage ? 'Mithila Event Gallery' : 'Event Gallery'}
            </h2>
            <p className={`text-white/80`}>
              Glimpses of our successful events and beautiful decorations.
            </p>
          </div>
          {!isFullPage && (
            <a href="/gallery" className="flex items-center gap-2 text-orange-400 font-bold hover:gap-3 transition-all group">
              View All Photos <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>

        <div className={`grid gap-6 ${isFullPage ? 'grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {displayedImages.map((img, i) => (
            <div key={i} className="flex flex-col gap-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedImage(i)}
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl border-4 border-white/20 cursor-pointer"
              >
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </motion.div>
              <div className="text-center md:text-left px-2">
                <p className="font-bold text-lg text-white uppercase tracking-wider">{img.title}</p>
                <p className="text-xs text-orange-400 font-bold">Mithila Catering & Decoration</p>
              </div>
            </div>
          ))}
        </div>
        
        {isFullPage && (
          <div className="mt-12 text-center">
            <p className="text-white font-bold animate-pulse">Click image to view in HD | Swipe to view more photos</p>
          </div>
        )}
      </div>

      {/* Lightbox / HD View */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 rounded-full transition-colors z-[110]"
            >
              <X size={32} />
            </button>

            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-10 text-white/70 hover:text-white p-3 bg-white/10 rounded-full transition-colors z-[110]"
            >
              <ChevronLeft size={40} />
            </button>

            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-10 text-white/70 hover:text-white p-3 bg-white/10 rounded-full transition-colors z-[110]"
            >
              <ChevronRight size={40} />
            </button>

            <motion.div 
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) nextImage();
                else if (swipe > 50) prevImage();
              }}
              className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center gap-6"
            >
              <img 
                src={images[selectedImage].url} 
                alt={images[selectedImage].title} 
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
              />
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-2">
                  {images[selectedImage].title}
                </h3>
                <p className="text-orange-400 font-bold">Mithila Catering & Decoration Service</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
