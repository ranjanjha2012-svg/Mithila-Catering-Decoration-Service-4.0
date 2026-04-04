import React, { useMemo } from 'react';
import { Users, Utensils, Star, Globe, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { menuItems } from '../constants/menu';

export default function Hero() {
  const stats = [
    { icon: <Users size={24} />, value: '4000+', label: 'Happy Customers' },
    { icon: <Utensils size={24} />, value: '600+', label: 'Caterings Done' },
    { icon: <Star size={24} />, value: '4.2', label: 'Average Rating' },
    { icon: <Globe size={24} />, value: 'PAN India', label: 'Service Available' },
  ];

  const featuredItems = useMemo(() => {
    return [...menuItems].sort(() => 0.5 - Math.random()).slice(0, 2);
  }, []);

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-hero-red-gradient">
      {/* Welcome Marquee */}
      <div className="absolute top-20 left-0 w-full bg-orange-600/80 backdrop-blur-md py-2 z-20 overflow-hidden border-y border-orange-400/30">
        <div className="whitespace-nowrap animate-marquee flex items-center gap-8">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white font-black text-xl uppercase tracking-widest flex items-center gap-4">
              Welcome to Mithila Catering & Decoration Service
            </span>
          ))}
        </div>
      </div>

      <div className="absolute inset-0 z-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=2000" 
          alt="Catering Background" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md text-white rounded-full text-sm font-bold mb-6 border border-white/20"
            >
              <span className="red-dot"></span>
              Serving Excellence Since 2021
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight"
            >
              Mithila Catering & <br />
              <span className="text-orange-400">Decoration Service</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-orange-50/80 mb-8 max-w-2xl mx-auto lg:mx-0"
            >
              We provide premium Catering, Tent, and DJ music services for all types of events across India. From weddings to corporate parties, we make every moment delicious and memorable.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              <a href="/contact" className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">
                Book Now
              </a>
              <a href="/gallery" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all">
                Our Gallery
              </a>
            </motion.div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <img 
                src="https://i.ibb.co/4g3QbFJ7/Whats-App-Image-2026-03-15-at-15-56-19-1.jpg" 
                alt="Event Celebration" 
                className="rounded-3xl shadow-2xl border-4 border-white"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl hidden sm:block">
                <p className="text-orange-600 font-black text-3xl">4.2</p>
                <p className="text-gray-500 text-xs font-bold uppercase">Google Rating</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-orange-600 flex justify-center mb-3">
                {stat.icon}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Featured Menu Items */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white">Featured Menu</h2>
            <a href="/order" className="text-orange-400 font-bold hover:text-orange-300 transition-colors flex items-center gap-2">
              View All <ShoppingBag size={20} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredItems.map((item, i) => (
              <motion.a
                key={item.id}
                href="/order"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row items-center gap-6 p-6 hover:bg-white/20 transition-all duration-500"
              >
                <div className="w-full sm:w-40 h-40 shrink-0 overflow-hidden rounded-2xl">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-black text-white mb-2">{item.name}</h3>
                  <p className="text-orange-100/60 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <span className="text-2xl font-black text-orange-400">₹{item.price}</span>
                    <span className="px-4 py-1.5 bg-orange-500 text-white text-xs font-black rounded-full uppercase tracking-widest">Order Now</span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Veg Tiffin Ad */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <a 
            href="/tiffin"
            className="block group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-green-600 to-green-800 p-8 md:p-12 shadow-2xl border-4 border-white/20 hover:scale-[1.02] transition-transform duration-500"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center px-4 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-black uppercase tracking-widest mb-4">
                  🔥 Limited Time Offer
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Pure Veg Tiffin <br />
                  <span className="text-yellow-400">Special Offer!</span>
                </h2>
                <p className="text-green-100/80 font-bold text-lg mb-0">
                  Book 30 days tiffin for just <span className="text-white text-2xl">₹2700/-</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white text-green-700 px-8 py-4 rounded-2xl font-black text-xl shadow-xl group-hover:bg-yellow-400 group-hover:text-green-900 transition-colors">
                  Book Now
                </div>
                <p className="text-green-200 text-xs font-bold uppercase tracking-widest">Click to Redirect</p>
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
