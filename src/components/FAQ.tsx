import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Do you customize catering packages for different event sizes?",
      answer: "Yes, absolutely! We customize our menu and service packages according to your guest count, budget, and culinary preferences. Whether it is an intimate family gathering of 50 people or a grand wedding celebration with over 1,000 guests, we design a tailored structure to ensure perfect service and zero wastage."
    },
    {
      question: "What cuisines do you specialize in?",
      answer: "We specialize in authentic Mithila & Bihari traditional cuisines as well as popular North Indian, South Indian, Chinese, and multi-cuisine high-tier catering. Our special sweets, thalis, and tiffin menus are prepared with farm-fresh ingredients and premium purity standards."
    },
    {
      question: "How is the food prepared, transported, and delivered?",
      answer: " p Our food is cooked under strict hygienic conditions in our professional kitchen, using premium sanitation standards. We transport food in specialized thermal insulated containers to ensure it arrives hot, fresh, and flavorful. For venue bookings, our logistics team manages doorstep delivery with dedicated buffet warmers."
    },
    {
      question: "Do you offer complete venue decoration services as well?",
      answer: "Yes, we are a full-service hospitality company! Along with gourmet catering, we provide exquisite venue decoration services including grand tents, entrance gateways, floral arrangements, dynamic stage lightings, wedding themes, and traditional Mithila art-inspired decorative settings."
    },
    {
      question: "Is there a minimum order count for delivery or catering services?",
      answer: "For our standard daily online order menu, there is no minimum guest limit. For our premium custom event catering packages (including buffet setups and waitstaff), our starting range is a minimum of 50 guests. Smaller events can also be accommodated via bulk delivery options."
    },
    {
      question: "Do you provide professional waiters and buffet service staff?",
      answer: "Yes, our events and weddings packages come with highly trained, professional waitstaff, buffet managers, and sanitation supervisors to ensure your guests experience top-tier, elegant hospitality."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-stone-50 border-t border-stone-100">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-black uppercase tracking-widest rounded-full border border-red-200/50 mb-3">
            <ShieldCheck size={13} /> Trust & Transparency
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 uppercase tracking-tighter flex items-center justify-center gap-3">
            <HelpCircle className="text-red-750 shrink-0" size={32} /> Frequently Asked Questions
          </h2>
          <p className="text-stone-500 font-semibold mt-3 max-w-xl mx-auto text-sm leading-relaxed">
            Have questions about our catering packages, venue decoration themes, or doorstep delivery? We have got you covered with direct and clear answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white border-2 border-stone-150 hover:border-red-200 rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-sm md:text-base font-extrabold text-[#000000] group-hover:text-[#800000]">
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-full ${isOpen ? 'bg-red-50 text-red-650' : 'bg-stone-55 text-stone-500'} transition-colors`}>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 text-xs md:text-sm text-[#000000] font-semibold border-t border-stone-50 leading-relaxed bg-stone-50/30">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
