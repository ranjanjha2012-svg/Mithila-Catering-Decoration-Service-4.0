import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Award, Star, Heart, FileText, ChevronRight, ChevronLeft, X, Maximize2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import CurtainLoader from './CurtainLoader';

export default function CareersPage() {
  const [slideshowIndex, setSlideshowIndex] = useState<number | null>(null);

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
      tags: ["100% Quality Certified", "Hygienic Sourcing", "Bulk Catering Catering Ready"],
      accent: "from-orange-600 to-rose-600"
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 cursor-default font-sans">
      <CurtainLoader />
      <Header />

      <main className="pt-36 lg:pt-32 pb-24">
        {/* Banner Section */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider mb-4"
            >
              <Sparkles size={14} className="text-orange-600" />
              Mithila Specialities
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-rose-950 mb-4 tracking-tight">Our Product Schemes</h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-xs md:text-sm font-bold uppercase tracking-wide leading-relaxed">
              Explore Mithila Catering's legendary gourmet assortments, bulk sweet distribution models, and certified production lines.
            </p>
          </div>

          {/* Majestic Bento Image/Description Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {schemes.map((scheme, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] border border-stone-200/60 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-orange-200 transition-all duration-300"
              >
                {/* Image Section clickable with beautiful magnify button */}
                <div 
                  onClick={() => setSlideshowIndex(idx)}
                  className="relative aspect-4/3 overflow-hidden bg-stone-100 border-b border-stone-100 cursor-pointer group/img"
                >
                  <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-950/40 transition-all duration-300 z-10 flex items-center justify-center">
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

                {/* Content Section */}
                <div className="p-8 md:p-10 flex-grow flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-black text-rose-955 tracking-tight group-hover:text-red-600 transition-colors">
                      {scheme.title}
                    </h2>
                    <p className="text-stone-600 text-xs md:text-sm font-medium leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>

                  {/* Tags & Badges */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 pt-2">
                      {scheme.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="bg-orange-50 text-orange-700 hover:bg-orange-100 text-[10px] font-black border border-orange-100/60 px-3 py-1 rounded-xl transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                      <div 
                        onClick={() => setSlideshowIndex(idx)}
                        className="flex items-center gap-1.5 text-[10px] font-black text-rose-900 uppercase cursor-pointer hover:text-orange-600 transition-colors"
                      >
                        <Award size={14} className="text-orange-500" /> Premium Grade Approved
                      </div>
                      <ChevronRight size={16} className="text-stone-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quality Banner & Pitch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-br from-rose-950 to-stone-900 text-white rounded-[3rem] p-8 md:p-14 relative overflow-hidden shadow-xl"
          >
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
              <Star size={300} />
            </div>
            
            <div className="max-w-2xl relative z-10 space-y-6">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 text-orange-300 text-[10px] font-extrabold uppercase rounded-full">
                <Star size={12} /> Satisfaction Guaranteed
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Want to book a customized sweet scheme for weddings?
              </h2>
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
                  View My Profile & Orders
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Product Schemes HD Slideshow Lightbox */}
      <AnimatePresence>
        {slideshowIndex !== null && (
          <div className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950/98 backdrop-blur-md p-4 md:p-8">
            {/* Header: Title and Close button */}
            <div className="flex justify-between items-center z-10 w-full">
              <div className="font-sans text-left">
                <span className="text-[10px] font-black uppercase text-orange-400 tracking-widest block">
                  Product Scheme HD Slideshow ({slideshowIndex + 1} of {schemes.length})
                </span>
                <span className="text-xl md:text-2xl font-black text-white block mt-0.5">
                  {schemes[slideshowIndex].title}
                </span>
              </div>
              <button
                onClick={() => setSlideshowIndex(null)}
                className="p-3 bg-white/10 hover:bg-orange-600 rounded-full text-white transition-colors cursor-pointer"
                aria-label="Close Slideshow"
              >
                <X size={20} />
              </button>
            </div>

            {/* Central Area: Chevron Left, Image Frame, Chevron Right */}
            <div className="flex-grow flex items-center justify-between gap-4 max-w-5xl mx-auto w-full relative my-4">
              <button
                onClick={() => setSlideshowIndex((slideshowIndex - 1 + schemes.length) % schemes.length)}
                className="p-3 bg-white/5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft size={24} />
              </button>

              <motion.div 
                key={slideshowIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex-grow flex items-center justify-center max-h-[55vh] md:max-h-[60vh] select-none"
              >
                <img
                  src={schemes[slideshowIndex].image}
                  alt={schemes[slideshowIndex].title}
                  referrerPolicy="no-referrer"
                  className="rounded-3xl max-h-[50vh] md:max-h-[55vh] w-auto max-w-full object-contain shadow-2xl border-2 border-white/10"
                />
              </motion.div>

              <button
                onClick={() => setSlideshowIndex((slideshowIndex + 1) % schemes.length)}
                className="p-3 bg-white/5 hover:bg-white/15 rounded-full text-white transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Footer: Description & Tags */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 max-w-3xl mx-auto w-full mb-4 font-sans text-left">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {schemes[slideshowIndex].tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="bg-orange-600/20 text-orange-300 text-[9px] font-black uppercase border border-orange-500/20 px-2.5 py-1 rounded-lg animate-pulse"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-zinc-300 text-xs md:text-sm font-semibold leading-relaxed">
                {schemes[slideshowIndex].description}
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
