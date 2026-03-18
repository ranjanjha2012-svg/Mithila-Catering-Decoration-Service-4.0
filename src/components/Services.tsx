import React from 'react';
import { Cake, Users, Briefcase, Heart, Music, Tent, Utensils, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';

export default function Services() {
  const services = [
    { icon: <Cake size={32} />, title: 'Birthday Parties', desc: 'Making your little one\'s big day extra special.', image: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=600' },
    { icon: <Users size={32} />, title: 'Kitty Parties', desc: 'Perfect snacks and meals for your social gatherings.', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600' },
    { icon: <Briefcase size={32} />, title: 'Corporate Parties', desc: 'Professional catering for meetings and events.', image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600' },
    { icon: <Heart size={32} />, title: 'Weddings', desc: 'Grand catering for the most important day of your life.', image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600' },
    { icon: <PartyPopper size={32} />, title: 'Anniversaries', desc: 'Celebrating years of togetherness with fine food.', image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=600' },
    { icon: <Utensils size={32} />, title: 'Bhandara', desc: 'Large scale traditional community feast catering.', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=600' },
    { icon: <Music size={32} />, title: 'DJ Music Service', desc: 'High-quality sound and music for all your events.', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=600' },
    { icon: <Tent size={32} />, title: 'Tent & Decoration', desc: 'Beautiful setups and tenting for any occasion.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <section id="services" className="py-20 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Premium Services</h2>
          <p className="text-orange-100/80 max-w-2xl mx-auto">From intimate gatherings to grand celebrations, we provide end-to-end solutions for all your event needs.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {services.map((service, i) => (
            <a href="/contact" key={i}>
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-orange-100 overflow-hidden hover:shadow-xl transition-all group h-full"
              >
                <div className="h-32 md:h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 md:p-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    {React.cloneElement(service.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-[10px] md:text-sm leading-tight md:leading-relaxed line-clamp-2">{service.desc}</p>
                </div>
              </motion.div>
            </a>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <a href="/tiffin" className="px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-sm">
            Learn More About Tiffin Service
          </a>
          <a href="/planner" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all text-sm">
            Plan Your Event with AI
          </a>
        </div>
      </div>
    </section>
  );
}
