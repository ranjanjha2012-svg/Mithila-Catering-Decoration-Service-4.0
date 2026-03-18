import React, { useState } from 'react';

export default function EnquiryForm() {
  const [guestOption, setGuestOption] = useState('');
  const [customGuests, setCustomGuests] = useState('');

  return (
    <section id="enquiry" className="py-20 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Quick Enquiry</h2>
          <p className="text-orange-100/80">Tell us about your event and we'll get back to you with a customized quote.</p>
        </div>

        <form 
          action="https://formspree.io/f/mqeybnnv" 
          method="POST"
          className="bg-[#064e3b] backdrop-blur-md p-8 rounded-3xl shadow-lg border border-green-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Place / Location</label>
              <input 
                type="text" 
                name="place" 
                required 
                placeholder="Event location"
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Approximate Guests</label>
              <select 
                name="guests_range" 
                required
                value={guestOption}
                onChange={(e) => setGuestOption(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white appearance-none cursor-pointer"
              >
                <option value="" className="bg-green-900 text-white">Select Quantity</option>
                <option value="50-100" className="bg-green-900 text-white">50 - 100</option>
                <option value="100-250" className="bg-green-900 text-white">100 - 250</option>
                <option value="250-500" className="bg-green-900 text-white">250 - 500</option>
                <option value="500-1000" className="bg-green-900 text-white">500 - 1000</option>
                <option value="1000+" className="bg-green-900 text-white">1000+</option>
                <option value="Other" className="bg-green-900 text-white">Other (Custom)</option>
              </select>
              {guestOption === 'Other' && (
                <div className="mt-2">
                  <input 
                    type="number" 
                    name="guests_custom" 
                    required 
                    value={customGuests}
                    onChange={(e) => setCustomGuests(e.target.value)}
                    placeholder="Enter specific number"
                    className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/50"
                  />
                </div>
              )}
              <input type="hidden" name="guests" value={guestOption === 'Other' ? customGuests : guestOption} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Catering Type</label>
              <select 
                name="catering_type" 
                required
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white appearance-none"
              >
                <option value="" className="bg-green-900 text-white">Select Type</option>
                <option value="Birthday Party" className="bg-green-900 text-white">Birthday Party</option>
                <option value="Kitty Party" className="bg-green-900 text-white">Kitty Party</option>
                <option value="Corporate Party" className="bg-green-900 text-white">Corporate Party</option>
                <option value="Bhandara" className="bg-green-900 text-white">Bhandara</option>
                <option value="Get Together" className="bg-green-900 text-white">Get Together</option>
                <option value="Wedding" className="bg-green-900 text-white">Wedding</option>
                <option value="Anniversary" className="bg-green-900 text-white">Anniversary</option>
                <option value="Bulk Order" className="bg-green-900 text-white">Bulk Order</option>
                <option value="Other" className="bg-green-900 text-white">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Event Date</label>
              <input 
                type="date" 
                name="date" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="Your contact number"
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-semibold text-white">Additional Details</label>
              <textarea 
                name="message" 
                rows={4}
                placeholder="Any special requirements?"
                className="w-full px-4 py-3 rounded-xl border border-green-700 bg-green-900/50 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-white placeholder:text-white/50"
              ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full mt-8 bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-200"
          >
            Submit Enquiry
          </button>
        </form>
      </div>
    </section>
  );
}
