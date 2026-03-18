import React from 'react';

export default function EnquiryForm() {
  return (
    <section id="enquiry" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Quick Enquiry</h2>
          <p className="text-gray-600">Tell us about your event and we'll get back to you with a customized quote.</p>
        </div>

        <form 
          action="https://formspree.io/f/mqeybnnv" 
          method="POST"
          className="bg-orange-50 p-8 rounded-3xl shadow-lg border border-orange-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Place / Location</label>
              <input 
                type="text" 
                name="place" 
                required 
                placeholder="Event location"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Approximate Guests</label>
              <input 
                type="number" 
                name="guests" 
                required 
                placeholder="Number of guests"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Catering Type</label>
              <select 
                name="catering_type" 
                required
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all bg-white"
              >
                <option value="">Select Type</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Kitty Party">Kitty Party</option>
                <option value="Corporate Party">Corporate Party</option>
                <option value="Bhandara">Bhandara</option>
                <option value="Get Together">Get Together</option>
                <option value="Wedding">Wedding</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Bulk Order">Bulk Order</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Event Date</label>
              <input 
                type="date" 
                name="date" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="Your contact number"
                className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Additional Details</label>
            <textarea 
              name="message" 
              rows={4}
              placeholder="Any special requirements?"
              className="w-full px-4 py-3 rounded-xl border border-orange-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
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
