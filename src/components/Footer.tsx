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
              <li><a href="/tiffin" className="hover:text-white transition-colors">Tiffin Service</a></li>
              <li><a href="/order" className="hover:text-white transition-colors">Order Online</a></li>
              <li><a href="/gallery" className="hover:text-white transition-colors">Event Gallery</a></li>
              <li><a href="/planner" className="hover:text-white transition-colors">AI Planner</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Enquiry Form</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-orange-800 pb-2">Contact Us</h3>
            <ul className="space-y-4 text-sm text-orange-200/70">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-orange-500 shrink-0" />
                <span>Office Address: Delhi, India (Serving Pan India)</span>
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
              <li className="flex items-center gap-3">
                <svg className="w-[18px] h-[18px] text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp: +91 9650254164</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500 shrink-0 font-bold">Hours:</span>
                <span>07:00 AM to 10:30 PM (All Days)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-orange-800 pb-2">Founder</h3>
            <div className="text-sm text-orange-200/70">
              <p className="font-bold text-white">Ranjan Kumar Jha (Founder)</p>
              <p className="mt-1 text-xs">Mithila Catering & Decoration Service</p>
              <p className="mt-2 italic">"Your satisfaction is our priority."</p>
            </div>
          </div>
        </div>

        <div className="border-t border-orange-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-orange-200/40">
          <p>© 2026 Mithila Catering & Decoration Service. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Design by <a href="https://waltdesignsstudio.in" target="_blank" rel="noopener noreferrer" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">Walt Designs & Studio</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
