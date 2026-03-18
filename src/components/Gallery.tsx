import React from 'react';
import { Camera, Play, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface GalleryProps {
  isFullPage?: boolean;
}

export default function Gallery({ isFullPage = false }: GalleryProps) {
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

  return (
    <section id="gallery" className={`py-20 ${isFullPage ? 'bg-golden-shiny min-h-screen' : 'bg-black/10 backdrop-blur-sm'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isFullPage ? 'text-orange-950' : 'text-white'}`}>
              {isFullPage ? 'Mithila Event Gallery' : 'Event Gallery'}
            </h2>
            <p className={`${isFullPage ? 'text-orange-900/80' : 'text-orange-100/80'}`}>
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
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-2xl border-4 border-white/20"
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <div className="text-white">
                  <p className="font-black text-xl md:text-2xl uppercase tracking-wider">{img.title}</p>
                  <p className="text-sm text-orange-400 font-bold">Mithila Catering & Decoration</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 md:hidden">
                 <p className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-bold inline-block">
                   {img.title}
                 </p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {isFullPage && (
          <div className="mt-12 text-center">
            <p className="text-orange-950/60 font-bold animate-pulse">Swipe to view more photos</p>
          </div>
        )}
      </div>
    </section>
  );
}
