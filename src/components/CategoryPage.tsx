import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, X, Phone, MapPin, User, Mail, MessageSquare, Info, ArrowRight, Loader2, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { MenuItem, menuItems } from '../constants/menu';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CurtainLoader from './CurtainLoader';

const locations = ['NOIDA', 'FARIDABAD', 'DELHI'];

interface CategoryPageProps {
  category: string;
  categoryName: string;
}

export default function CategoryPage({ category, categoryName }: CategoryPageProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'half' | 'full' | 'single'>('single');
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'popularity' | 'default'>('default');
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    whatsapp: '',
    address: '',
    email: '',
    description: '',
    location: '',
    orderDate: '',
    orderTime: ''
  });

  const getPrice = (item: MenuItem) => {
    return item.price || item.halfPrice || 0;
  };

  const filteredItems = menuItems
    .filter(item => item.category === category)
    .sort((a, b) => {
      if (sortBy === 'price-low') return getPrice(a) - getPrice(b);
      if (sortBy === 'price-high') return getPrice(b) - getPrice(a);
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      return 0;
    });

  const packingCharge = 12;
  const deliveryCharge = 40;

  const getItemPrice = () => {
    if (!selectedItem) return 0;
    if (selectedSize === 'half') return selectedItem.halfPrice || 0;
    if (selectedSize === 'full') return selectedItem.fullPrice || 0;
    return selectedItem.price || 0;
  };

  const currentPrice = getItemPrice();
  const totalAmount = currentPrice + packingCharge + deliveryCharge;

  const upiId = "9650254164@kotak";
  const upiLink = `upi://pay?pa=${upiId}&pn=Mithila%20Catering&am=${totalAmount}&cu=INR`;

  const handleOrderClick = (item: MenuItem) => {
    setSelectedItem(item);
    if (item.halfPrice && item.fullPrice) {
      setSelectedSize('half');
    } else {
      setSelectedSize('single');
    }
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
          item_size: selectedSize !== 'single' ? selectedSize : 'Standard',
          item_price: currentPrice,
          total_amount: totalAmount,
          order_date: formData.orderDate,
          order_time: formData.orderTime,
          _subject: `New Order: ${selectedItem?.name} (${selectedSize}) from ${formData.name}`
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
    <div className="min-h-screen bg-sky-100">
      <CurtainLoader />
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 relative">
            <motion.a
              href="/order.html"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute left-0 top-0 hidden md:flex items-center gap-2 text-stone-500 hover:text-orange-600 font-bold transition-colors group"
            >
              <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Menu
            </motion.a>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold mb-4"
            >
              <ShoppingCart size={16} />
              {categoryName}
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-stone-900 mb-4">{categoryName}</h1>
            <p className="text-stone-600 max-w-2xl mx-auto mb-8">
              Freshly prepared {categoryName.toLowerCase()} delivered to your doorstep.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2 w-full justify-center mb-2">
                Sort By
              </span>
              <button
                onClick={() => setSortBy('default')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'default' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Default
              </button>
              <button
                onClick={() => setSortBy('price-low')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'price-low' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Price: Low to High
              </button>
              <button
                onClick={() => setSortBy('price-high')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'price-high' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Price: High to Low
              </button>
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${sortBy === 'popularity' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 hover:bg-stone-100'}`}
              >
                Popularity
              </button>
            </div>

            <motion.a
              href="/order.html"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 md:hidden inline-flex items-center gap-2 text-orange-600 font-bold"
            >
              <ArrowRight size={18} className="rotate-180" />
              Back to Menu
            </motion.a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredItems.map((item, i) => (
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
                    <span className="text-xl font-black text-orange-600">
                      {item.price ? `₹${item.price}${item.unit ? ` / ${item.unit}` : ''}` : `₹${item.halfPrice} / ₹${item.fullPrice}`}
                    </span>
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
        </div>
      </main>

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
                {selectedItem?.halfPrice && selectedItem?.fullPrice && (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      Select Size
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedSize('half')}
                        className={`py-4 rounded-2xl font-bold transition-all ${selectedSize === 'half' ? 'bg-orange-600 text-white shadow-lg' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                      >
                        Half (₹{selectedItem.halfPrice})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSize('full')}
                        className={`py-4 rounded-2xl font-bold transition-all ${selectedSize === 'full' ? 'bg-orange-600 text-white shadow-lg' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                      >
                        Full (₹{selectedItem.fullPrice})
                      </button>
                    </div>
                  </div>
                )}

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      Order Date
                    </label>
                    <input 
                      type="date" 
                      name="orderDate" 
                      required 
                      value={formData.orderDate}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black cursor-pointer"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                      Order Time
                    </label>
                    <input 
                      type="time" 
                      name="orderTime" 
                      required 
                      value={formData.orderTime}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 rounded-2xl border border-stone-100 bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all font-bold text-black cursor-pointer"
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
                  <span>Item: {selectedItem?.name} {selectedSize !== 'single' ? `(${selectedSize})` : ''}</span>
                  <span className="font-bold text-stone-900">₹{currentPrice}</span>
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
                  href={`https://wa.me/919650254164?text=Namaste Mithila Catering! I have just placed an order for ${selectedItem?.name} (${selectedSize !== 'single' ? selectedSize : 'Standard'}). My delivery address is: ${formData.address}, ${formData.location}. Order Date: ${formData.orderDate}, Order Time: ${formData.orderTime}. Total amount paid: ₹${totalAmount}. Please confirm my order.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-lg shadow-green-900/20"
                >
                  <WhatsAppButton />
                  Share on WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
