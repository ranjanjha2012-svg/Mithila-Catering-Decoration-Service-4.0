import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Check, X, Phone, MapPin, User, Mail, MessageSquare, CreditCard, Smartphone, Info, ArrowRight, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { menuItems, MenuItem } from '../constants/menu';

const locations = ['NOIDA', 'FARIDABAD', 'DELHI'];

export default function OrderOnline() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    whatsapp: '',
    address: '',
    email: '',
    description: '',
    location: ''
  });

  const packingCharge = 12;
  const deliveryCharge = 40;
  const totalAmount = (selectedItem?.price || 0) + packingCharge + deliveryCharge;

  const upiId = "9650254164@kotak";
  const upiLink = `upi://pay?pa=${upiId}&pn=Mithila%20Catering&am=${totalAmount}&cu=INR`;

  const handleOrderClick = (item: MenuItem) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/meeprnbl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          item_name: selectedItem?.name,
          item_price: selectedItem?.price,
          total_amount: totalAmount,
          _subject: `New Order: ${selectedItem?.name} from ${formData.name}`
        })
      });

      if (response.ok) {
        setShowForm(false);
        setShowPayment(true);
      } else {
        alert("Something went wrong. Please try again or contact us directly.");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Failed to submit order. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-sky-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4"
          >
            <ShoppingCart size={16} />
            Fresh & Authentic
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-4">Order Online</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Experience the authentic taste of Mithila at your doorstep. Freshly prepared and delivered with love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-xl border border-stone-100 group hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg">
                  <span className="text-xl font-black text-orange-600">₹{item.price}</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-black text-stone-900 mb-2">{item.name}</h3>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed">{item.description}</p>
                <button
                  onClick={() => handleOrderClick(item)}
                  className="w-full py-4 bg-stone-900 text-white font-black rounded-2xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                >
                  Order Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 relative shadow-2xl"
              >
                <button 
                  onClick={() => setShowForm(false)}
                  className="absolute top-8 right-8 p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-stone-400" />
                </button>

                <div className="mb-8">
                  <h2 className="text-3xl font-black text-stone-900 mb-2">Complete Your Order</h2>
                  <p className="text-stone-500">Ordering: <span className="text-orange-600 font-bold">{selectedItem?.name}</span></p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <ShoppingCart size={14} /> Item Name
                    </label>
                    <input 
                      type="text" 
                      name="item_name" 
                      readOnly 
                      value={selectedItem?.name || ''}
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-stone-100 text-stone-500 font-bold cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Full Name
                      </label>
                      <input 
                        type="text" 
                        name="name" 
                        required 
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your name"
                        className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black placeholder:text-stone-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={14} /> Phone Number
                      </label>
                      <input 
                        type="tel" 
                        name="number" 
                        required 
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="Your contact number"
                        className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                        <Smartphone size={14} /> WhatsApp Number
                      </label>
                      <input 
                        type="tel" 
                        name="whatsapp" 
                        required 
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="WhatsApp number"
                        className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black placeholder:text-stone-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} /> Email (Optional)
                      </label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your email address"
                        className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} /> Delivery Address
                    </label>
                    <textarea 
                      name="address" 
                      required 
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter complete delivery address"
                      rows={3}
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black placeholder:text-stone-400 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={14} /> Location
                      </label>
                      <select 
                        name="location" 
                        required 
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black appearance-none cursor-pointer"
                      >
                        <option value="">Select Location</option>
                        {locations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={14} /> Description
                      </label>
                      <input 
                        type="text" 
                        name="description" 
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Any special instructions?"
                        className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black placeholder:text-stone-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl hover:bg-orange-700 transition-all uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>Processing... <Loader2 size={20} className="animate-spin" /></>
                    ) : (
                      <>Confirm & Pay <ArrowRight size={20} /></>
                    )}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 md:p-12 relative shadow-2xl"
              >
                <button 
                  onClick={() => setShowPayment(false)}
                  className="absolute top-8 right-8 p-2 hover:bg-stone-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-stone-400" />
                </button>

                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-stone-900 mb-2">Payment Details</h2>
                  <p className="text-stone-500">Complete your payment to confirm order</p>
                </div>

                <div className="bg-stone-50 rounded-3xl p-8 mb-8 space-y-4">
                  <div className="flex justify-between text-stone-600">
                    <span>Item: {selectedItem?.name}</span>
                    <span className="font-bold text-stone-900">₹{selectedItem?.price}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Packing Charges</span>
                    <span className="font-bold text-stone-900">₹{packingCharge}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Delivery Charges</span>
                    <span className="font-bold text-stone-900">₹{deliveryCharge}</span>
                  </div>
                  <div className="pt-4 border-t border-stone-200">
                    <div className="flex justify-between text-2xl font-black text-stone-900">
                      <span>Total Payable</span>
                      <span className="text-orange-600">₹{totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-8 mb-12">
                  <div className="p-6 bg-white rounded-[2rem] shadow-2xl border border-stone-100">
                    <QRCodeSVG value={upiLink} size={200} />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-stone-900 text-lg">Scan & Pay</p>
                    <p className="text-sm text-stone-400 font-bold">UPI ID: {upiId}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-center text-xs font-black text-stone-400 uppercase tracking-widest">Pay with UPI Apps</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a 
                      href={upiLink}
                      className="flex flex-col items-center gap-3 p-6 bg-stone-50 rounded-2xl border-2 border-transparent hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-8 w-16 object-contain" />
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-tighter">Google Pay</span>
                    </a>
                    <a 
                      href={upiLink}
                      className="flex flex-col items-center gap-3 p-6 bg-stone-50 rounded-2xl border-2 border-transparent hover:border-sky-500 hover:bg-sky-50 transition-all group"
                    >
                      <img src="https://cdn.worldvectorlogo.com/logos/paytm-1.svg" alt="Paytm" className="h-8 w-16 object-contain" />
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-tighter">Paytm</span>
                    </a>
                    <a 
                      href={upiLink}
                      className="flex flex-col items-center gap-3 p-6 bg-stone-50 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg" alt="PhonePe" className="h-8 w-16 object-contain" />
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-tighter">PhonePe</span>
                    </a>
                  </div>
                </div>

                <div className="mt-12 bg-orange-50 p-6 rounded-3xl border border-orange-100 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <Info size={24} className="text-orange-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-stone-800 font-bold mb-1">Important Step:</p>
                      <p className="text-sm text-stone-600">
                        Please <strong>share a screenshot</strong> of your payment at WhatsApp <strong>+91 9650254164</strong> along with your order details to confirm.
                      </p>
                    </div>
                  </div>
                  <a 
                    href={`https://wa.me/919650254164?text=Namaste Mithila Catering! I have just placed an order for ${selectedItem?.name}. My delivery address is: ${formData.address}, ${formData.location}. Total amount paid: ₹${totalAmount}. Please confirm my order.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg shadow-green-900/20"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Share on WhatsApp
                  </a>
                </div>

                <div className="mt-6 bg-blue-50 p-6 rounded-3xl border border-blue-100">
                  <p className="text-xs font-black text-blue-800 uppercase mb-3 tracking-widest">AI Order Summary</p>
                  <p className="text-sm text-blue-900 italic leading-relaxed">
                    "User {formData.name} from {formData.location} has ordered {selectedItem?.name}. Total amount payable is ₹{totalAmount} (including ₹{packingCharge} packing & ₹{deliveryCharge} delivery). Delivery address: {formData.address}."
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
