import React from 'react';
import { Users, Utensils, Star, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export default function Hero() {
  const stats = [
    { icon: <Users size={24} />, value: '4000+', label: 'Happy Customers' },
    { icon: <Utensils size={24} />, value: '600+', label: 'Caterings Done' },
    { icon: <Star size={24} />, value: '4.2', label: 'Average Rating' },
    { icon: <Globe size={24} />, value: 'PAN India', label: 'Service Available' },
  ];

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-hero-red-gradient">
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
              We provide premium catering, tent, and DJ music services for all types of events across India. From weddings to corporate parties, we make every moment delicious and memorable.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              <a href="#enquiry" className="px-8 py-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">
                Book Now
              </a>
              <a href="#services" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border-2 border-white/20 hover:bg-white/20 transition-all">
                Our Services
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
      </div>
    </section>
  );
}
