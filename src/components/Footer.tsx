import React from 'react';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-orange-950 text-orange-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://i.ibb.co/Y4fS5FDr/file-000000003bec71faa9b37e16b055cb49.png" 
                alt="Mithila Catering Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h2 className="text-xl font-bold">Mithila Catering &</h2>
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-tighter">Decoration Service</p>
              </div>
            </div>
            <p className="text-orange-200/70 text-sm leading-relaxed">
              Serving premium catering and decoration services since 2021. We bring the authentic taste and beautiful decor to your special occasions pan India.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-orange-800 pb-2">Quick Links</h3>
            <ul className="space-y-3 text-sm text-orange-200/70">
              <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="/gallery" className="hover:text-white transition-colors">Event Gallery</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Enquiry Form</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-orange-800 pb-2">Contact Us</h3>
            <ul className="space-y-4 text-sm text-orange-200/70">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0" />
                <span>Head Office: Delhi, India (Serving Pan India)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <span>+91 9650254164</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-orange-500 shrink-0" />
                <div className="flex flex-col">
                  <span>ranjanjha2012@gmail.com</span>
                  <span className="text-xs">mithilacateringservice@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-orange-800 pb-2">Owner</h3>
            <div className="text-sm text-orange-200/70">
              <p className="font-bold text-white">Ranjan Kumar Jha</p>
              <p className="mt-2 italic">"Your satisfaction is our priority."</p>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-orange-200/40">
          <p>© 2026 Mithila Catering & Decoration Service. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Design by <span className="text-orange-400 font-semibold">Walt Designs & Studio</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
