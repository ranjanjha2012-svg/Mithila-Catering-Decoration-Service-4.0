import React, { useState } from 'react';
import { Camera, Play, Image as ImageIcon, ChevronRight, X, ChevronLeft, ArrowRight, Sparkles, Award, Star, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const schemes = [
  {
    title: "Sweets Special",
    description: "Exquisite traditionally curated assortment of luxury sweets made with premium ingredients, pure desi ghee, and authentic Mithila culinary secrets. Designed to sweeten your grand occasions and festive distribution.",
    image: "https://i.ibb.co/tT2mXMJR/Whats-App-Image-2026-05-29-at-22-41-35.jpg",
    tags: ["Pure Desi Ghee", "Festive Favorite", "Traditional Mithila Recipe"],
    accent: "from-amber-600 to-orange-500"
  },
  {
    title: "Premium Balushahi",
    description: "Our signature golden-crusted Balushahi pastries, boasting flaky, layered textures and delicate cardamom-scented sugar glaze. Handcrafted daily by family-heritage experts with pristine quality metrics.",
    image: "https://i.ibb.co/HpPLcrBt/Whats-App-Image-2026-05-29-at-22-41-35-1.jpg",
    tags: ["Flaky Layers", "Heritage Craftsmanship", "Signature Sweet"],
    accent: "from-red-600 to-amber-600"
  },
  {
    title: "Quality Products Assurance",
    description: "Our certified production line metrics guarantee high sanitation standards and organic material sourcing for wedding banquets, corporate meetings, and family celebration packages.",
    image: "https://i.ibb.co/4nPVVJKs/Whats-App-Image-2026-05-29-at-23-01-33.jpg",
    tags: ["100% Quality Certified", "Hygienic Sourcing", "Bulk Catering Ready"],
    accent: "from-orange-600 to-rose-600"
  }
];

interface GalleryProps {
  isFullPage?: boolean;
}

export default function Gallery({ isFullPage = false }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [slideshowSchemeIndex, setSlideshowSchemeIndex] = useState<number | null>(null);

  const images = [
    { url: 'https://i.ibb.co/CyX2X5F/Whats-App-Image-2026-06-27-at-11-43-25.jpg', title: 'Bhandara' },
    { url: 'https://i.ibb.co/yBnHM13B/Whats-App-Image-2026-06-27-at-11-43-25-1.jpg', title: 'Proper Management' },
    { url: 'https://i.ibb.co/yCStHXZ/Whats-App-Image-2026-06-27-at-11-43-27.jpg', title: 'Buff System' },
    { url: 'https://i.ibb.co/h0Gw9XY/Whats-App-Image-2026-06-27-at-11-43-30.jpg', title: 'High Quality Materials' },
    { url: 'https://i.ibb.co/pBNq76Kz/Whats-App-Image-2026-06-27-at-11-43-30-1.jpg', title: 'Customers Intractions to Smile :) (Dwarka)' },
    { url: 'https://i.ibb.co/pBNq76Kz/Whats-App-Image-2026-06-27-at-11-43-30-1.jpg', title: 'Gulab Jaamun (Dwarka)' },
    { url: 'https://i.ibb.co/gMJqwqCr/Whats-App-Image-2026-06-27-at-11-43-31-1.jpg', title: 'Chowmein (Dwarka)' },
    { url: 'https://i.ibb.co/V0KgQ9ww/Whats-App-Image-2026-06-27-at-11-43-32.jpg', title: 'Paneer Butter Masala (Dwarka)' },
    { url: 'https://i.ibb.co/4n1NySv5/Whats-App-Image-2026-06-27-at-11-43-32-1.jpg', title: 'Aloo Parwal (Dwarka)' },
    { url: 'https://i.ibb.co/gM3qQNw4/Whats-App-Image-2026-06-27-at-11-43-33.jpg', title: 'Proper Buffet (Dwarka)' },
    { url: 'https://i.ibb.co/Ng76m7w5/Whats-App-Image-2026-06-27-at-11-43-34.jpg', title: 'Salad & Spoons' },
    { url: 'https://i.ibb.co/My08v1wg/Whats-App-Image-2026-06-27-at-11-43-34-1.jpg', title: 'Rice (Dwarka)' },
    { url: 'https://i.ibb.co/wNXtfftq/Whats-App-Image-2026-06-27-at-11-43-38.jpg', title: 'Puri (Dwarka)' },
    { url: 'https://i.ibb.co/C3vWxnSg/Whats-App-Image-2026-06-27-at-11-43-38-1.jpg', title: 'Boondi Raita (Dwarka)' },
    { url: 'https://i.ibb.co/wrSYmC6k/Whats-App-Image-2026-06-27-at-11-43-39.jpg', title: 'Mix Pakora (Dwarka)' },
    { url: 'https://i.ibb.co/FNFbDws/Whats-App-Image-2026-06-27-at-11-43-39-1.jpg', title: 'Halwai (Dwarka)' },
    { url: 'https://i.ibb.co/KpHm177y/Whats-App-Image-2026-06-27-at-11-43-39-2.jpg', title: 'Live Food Making (Dwarka)' },
    { url: 'https://i.ibb.co/YFSsscRc/Whats-App-Image-2026-06-27-at-11-43-40.jpg', title: 'Dal Makhani (Dwarka)' },
    { url: 'https://i.ibb.co/4Rv9NgKZ/Whats-App-Image-2026-06-27-at-11-43-40-1.jpg', title: 'Bhandara below Metro Station' },
    { url: 'https://i.ibb.co/Y766FZW5/Whats-App-Image-2026-06-27-at-11-43-41.jpg', title: 'Proper Look Management in Affordable Price' },
    { url: 'https://i.ibb.co/tMY5DWn4/Whats-App-Image-2026-06-27-at-11-43-43.jpg', title: 'Backup Water Options' },
    { url: 'https://i.ibb.co/4nVfNtHh/Whats-App-Image-2026-06-27-at-11-43-45.jpg', title: 'Live Puri Making' },
    { url: 'https://i.ibb.co/0jsyMMjC/Whats-App-Image-2026-06-27-at-11-43-46.jpg', title: 'Hot & Tasty' },
    { url: 'https://i.ibb.co/qYMRR3hX/Whats-App-Image-2026-06-27-at-11-43-47.jpg', title: 'Value of Money' },
    { url: 'https://i.ibb.co/SXRF76nG/Whats-App-Image-2026-06-27-at-11-43-47-1.jpg', title: '10 Person Birthday Party Food' },
    { url: 'https://i.ibb.co/B2w4sg41/Whats-App-Image-2026-06-27-at-11-43-48.jpg', title: 'Container Packing Available' },
    { url: 'https://i.ibb.co/MxWdv2DS/Whats-App-Image-2026-06-27-at-11-43-49.jpg', title: 'Premium Quality' },
    { url: 'https://i.ibb.co/xSC0HZ6z/Whats-App-Image-2026-06-27-at-11-43-49-1.jpg', title: 'Bhandara at NIT,FBD' },
    { url: 'https://i.ibb.co/7JdSBdhp/Whats-App-Image-2026-06-27-at-11-43-50.jpg', title: 'Chief Guesting' },
    { url: 'https://i.ibb.co/xqG0kb14/Whats-App-Image-2026-06-27-at-11-43-51.jpg', title: 'Tiffin Service' },
    { url: 'https://i.ibb.co/2p0bTWG/Whats-App-Image-2026-06-27-at-11-43-51-1.jpg', title: 'Bhandara at Greenfields Colony (26th June 2026)' },
    { url: 'https://i.ibb.co/BVDZdjYK/Whats-App-Image-2026-06-27-at-11-43-52.jpg', title: '500 Peoples Bhandara' },
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
    <section id="gallery" className={`py-20 ${isFullPage ? 'bg-blood min-h-screen' : 'bg-orange-600'}`}>
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
            <a href="/gallery" className="flex items-center gap-2 text-white font-bold hover:text-orange-200 hover:gap-3 transition-all group">
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
                <p className="text-xs text-orange-200 font-bold">Mithila Catering & Decoration</p>
              </div>
            </div>
          ))}
        </div>
        
        {isFullPage && (
          <div className="mt-12 text-center">
            <p className="text-white font-bold animate-pulse">Click image to view in HD | Swipe to view more photos</p>
          </div>
        )}

        {/* Dynamic Product Schemes Merged Section */}
        {isFullPage && (
          <div id="product-schemes" className="mt-28 pt-16 border-t border-white/20 select-none">
            <div className="text-center mb-16 relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 text-orange-200 rounded-full text-xs font-black uppercase tracking-wider mb-4 border border-orange-500/10">
                <Sparkles size={14} className="text-orange-400" />
                Mithila Specialities
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Our Product Schemes</h2>
              <p className="text-orange-200/75 max-w-2xl mx-auto text-xs md:text-sm font-semibold uppercase tracking-wide leading-relaxed">
                Explore Mithila Catering's legendary gourmet assortments, bulk sweet distribution models, and certified production lines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {schemes.map((scheme, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-orange-500/50 transition-all duration-300"
                >
                  <div 
                    onClick={() => setSlideshowSchemeIndex(idx)}
                    className="relative aspect-4/3 overflow-hidden bg-stone-900/40 border-b border-white/5 cursor-pointer group/img"
                  >
                    <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/60 transition-all duration-300 z-10 flex items-center justify-center">
                      <span className="opacity-0 group-hover/img:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/img:translate-y-0 bg-orange-600/95 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-orange-600/35">
                        <Maximize2 size={12} />
                        <span>Open Slideshow HD</span>
                      </span>
                    </div>
                    <img
                      src={scheme.image}
                      alt={scheme.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0"
                    />
                    <div className={`absolute top-4 left-4 bg-gradient-to-r ${scheme.accent} text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-md z-20`}>
                      #{idx + 1} Scheme
                    </div>
                  </div>

                  <div className="p-8 md:p-10 flex-grow flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                        {scheme.title}
                      </h3>
                      <p className="text-orange-100/80 text-xs md:text-sm font-semibold leading-relaxed">
                        {scheme.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 pt-2">
                        {scheme.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="bg-orange-600/20 text-orange-200 hover:bg-orange-600/30 text-[10px] font-black border border-orange-500/20 px-3 py-1 rounded-xl transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                        <div 
                          onClick={() => setSlideshowSchemeIndex(idx)}
                          className="flex items-center gap-1.5 text-[10px] font-black text-orange-200 uppercase cursor-pointer hover:text-orange-400 transition-colors"
                        >
                          <Award size={14} className="text-orange-400" /> Premium Grade Approved
                        </div>
                        <ChevronRight size={16} className="text-orange-300 group-hover:translate-x-1 group-hover:text-orange-400 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quality Banner & Pitch inside event gallery */}
            <div className="mt-16 bg-gradient-to-br from-stone-900 to-rose-955 text-white rounded-[3rem] p-8 md:p-14 border border-white/10 relative overflow-hidden shadow-2xl text-left">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                <Star size={300} />
              </div>
              
              <div className="max-w-2xl relative z-10 space-y-6">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/15 text-orange-300 text-[10px] font-extrabold uppercase rounded-full border border-white/10">
                  <Star size={12} /> Satisfaction Guaranteed
                </div>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Want to book a customized sweet scheme for weddings?
                </h3>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
                  Connect directly with our culinary lead on WhatsApp or give us a call. We offer customized packaging boxes branded with your family initials and personalized traditional sweet trays.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="/order.html"
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-colors inline-block"
                  >
                    Book Culinary Catering
                  </a>
                  <a
                    href="/profile.html"
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors inline-block"
                  >
                    View My Profile &amp; Orders
                  </a>
                </div>
              </div>
            </div>
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

      {/* Product Schemes HD Slideshow Lightbox */}
      <AnimatePresence>
        {slideshowSchemeIndex !== null && (
          <div className="fixed inset-0 z-[110] flex flex-col justify-between bg-zinc-950/98 backdrop-blur-md p-4 md:p-8 text-left">
            {/* Header: Title and Close button */}
            <div className="flex justify-between items-center z-10 w-full mb-4">
              <div className="font-sans">
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest block">
                  Product Scheme HD Slideshow ({slideshowSchemeIndex + 1} of {schemes.length})
                </span>
                <span className="text-xl md:text-2xl font-black text-white block mt-0.5">
                  {schemes[slideshowSchemeIndex].title}
                </span>
              </div>
              <button
                onClick={() => setSlideshowSchemeIndex(null)}
                className="p-3 bg-white/10 hover:bg-orange-600 rounded-full text-white transition-colors cursor-pointer"
                aria-label="Close Slideshow"
              >
                <X size={20} />
              </button>
            </div>

            {/* Central Area: Chevron Left, Image Frame, Chevron Right */}
            <div className="flex-grow flex items-center justify-between gap-4 max-w-5xl mx-auto w-full relative my-4">
              <button
                onClick={() => setSlideshowSchemeIndex((slideshowSchemeIndex - 1 + schemes.length) % schemes.length)}
                className="p-3 bg-white/5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft size={24} />
              </button>

              <motion.div 
                key={slideshowSchemeIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex-grow flex items-center justify-center max-h-[55vh] md:max-h-[60vh] select-none"
              >
                <img
                  src={schemes[slideshowSchemeIndex].image}
                  alt={schemes[slideshowSchemeIndex].title}
                  referrerPolicy="no-referrer"
                  className="rounded-3xl max-h-[50vh] md:max-h-[55vh] w-auto max-w-full object-contain shadow-2xl border-2 border-white/10"
                />
              </motion.div>

              <button
                onClick={() => setSlideshowSchemeIndex((slideshowSchemeIndex + 1) % schemes.length)}
                className="p-3 bg-white/5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Footer: Description & Tags */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 max-w-3xl mx-auto w-full mb-4 font-sans text-left">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {schemes[slideshowSchemeIndex].tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="bg-orange-600/20 text-orange-300 text-[9px] font-black uppercase border border-orange-500/20 px-2.5 py-1 rounded-lg animate-pulse"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-zinc-300 text-xs md:text-sm font-semibold leading-relaxed">
                {schemes[slideshowSchemeIndex].description}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
