import React from 'react';

export default function GoogleMap() {
  return (
    <section className="w-full h-[300px] md:h-[450px] relative">
      <iframe 
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.8392319277!2d77.06889754725782!3d28.527280306053616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715326640f!2sDelhi!5e0!3m2!1sen!2sin!4v1710731480000!5m2!1sen!2sin" 
        width="100%" 
        height="100%" 
        style={{ border: 0 }} 
        allowFullScreen 
        loading="lazy" 
        referrerPolicy="no-referrer-when-downgrade"
        title="Mithila Catering Location"
      ></iframe>
      <div className="absolute top-4 left-4 bg-white p-4 rounded-xl shadow-lg border border-orange-100 hidden md:block">
        <h4 className="font-bold text-orange-800">Head Office</h4>
        <p className="text-sm text-gray-600">Delhi, India</p>
        <p className="text-xs text-orange-600 font-semibold mt-1">Serving Pan India</p>
      </div>
    </section>
  );
}
