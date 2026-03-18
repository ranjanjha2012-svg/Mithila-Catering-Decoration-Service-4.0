import React from 'react';
import { Camera, Play, Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const images = [
    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800',
  ];

  return (
    <section id="gallery" className="py-20 bg-black/10 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Event Gallery</h2>
            <p className="text-orange-100/80">Glimpses of our successful events and beautiful decorations.</p>
          </div>
          <button className="flex items-center gap-2 text-orange-400 font-bold hover:gap-3 transition-all">
            View All Photos <ImageIcon size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-lg">
              <img 
                src={img} 
                alt={`Gallery ${i}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <div className="text-white">
                  <p className="font-bold text-lg">Mithila Special Event</p>
                  <p className="text-sm text-white/80">Catering & Decoration</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
