import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { auth } from '../lib/firebase';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, CreditCard, ClipboardCheck, 
  MapPin, Loader2, Info, Send, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRequest?: () => void;
}

const locations = ['NOIDA', 'FARIDABAD', 'DELHI'];

export default function CartDrawer({ isOpen, onClose, onLoginRequest }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, placeOrder } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    whatsapp: '',
    address: '',
    location: '',
    orderDate: new Date().toISOString().split('T')[0],
    orderTime: '12:00'
  });

  const packingCharge = cart.length > 0 ? 12 : 0;
  const deliveryCharge = cart.length > 0 ? 40 : 0;
  const totalAmount = cartTotal + packingCharge + deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      if (onLoginRequest) {
        onLoginRequest();
      } else {
        alert("Please log in first to proceed.");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrderId = await placeOrder(formData, paymentMethod);
      setOrderId(newOrderId);
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Please check connections or permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiId = "9650254164@kotak";
  const upiLink = `upi://pay?pa=${upiId}&pn=Mithila%20Catering&am=${totalAmount}&cu=INR`;

  const itemsListString = cart.map((i) => `• ${i.name} (${i.size}) x${i.quantity}`).join('\n');
  const whatsappText = `Namaste Mithila Catering! I have just placed order *#${orderId || ''}* via *${paymentMethod}*.
  
*Order Details:*
${itemsListString}

*Delivery Details:*
*Name:* ${formData.name}
*Phone:* ${formData.number}
*WhatsApp:* ${formData.whatsapp}
*Address:* ${formData.address}, ${formData.location}
*Date:* ${formData.orderDate}
*Time:* ${formData.orderTime}
*Total Paid/Due:* ₹${totalAmount}

Please confirm my order immediately.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-orange-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-orange-50 flex items-center justify-between bg-orange-50/50">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-orange-600" />
                  <h3 className="text-lg font-black text-neutral-800">Your Mithila Cart</h3>
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-orange-100/50 rounded-xl transition-colors text-neutral-500"
                  id="close-cart-drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {orderId ? (
                /* Success View */
                <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-neutral-800">Order Placed Successfully!</h4>
                    <p className="text-xs text-neutral-400 mt-1 font-mono uppercase tracking-wider">ID: {orderId}</p>
                    <p className="text-neutral-500 text-sm mt-3 leading-relaxed">
                      We have received your order details securely. Please share the order summary on WhatsApp to initiate immediate kitchen preparations.
                    </p>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex flex-col items-center space-y-2">
                      <QRCodeSVG value={upiLink} size={130} />
                      <p className="text-[11px] font-black text-neutral-800">Scan & Pay ₹{totalAmount}</p>
                    </div>
                  )}

                  <div className="w-full space-y-3">
                    <a
                      href={`https://wa.me/919650254164?text=${encodeURIComponent(whatsappText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                    >
                      <Send size={15} />
                      Share on WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setOrderId(null);
                        setShowCheckout(false);
                        onClose();
                      }}
                      className="w-full text-center py-2.5 text-neutral-500 hover:text-orange-600 text-xs font-bold transition-colors"
                    >
                      Continue Menu Exploring
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Cart / Checkout View */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-neutral-50 text-neutral-300 rounded-full flex items-center justify-center">
                          <ShoppingBag size={28} />
                        </div>
                        <div>
                          <p className="font-extrabold text-neutral-800">Your cart is empty</p>
                          <p className="text-xs text-neutral-400 mt-1">Add items from our order menu to start!</p>
                        </div>
                      </div>
                    ) : !showCheckout ? (
                      /* Items list */
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 border border-neutral-100 bg-neutral-50/40 rounded-2xl"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-xl shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-black text-neutral-800 truncate">{item.name}</h4>
                              <p className="text-xs text-neutral-400 font-bold capitalize mt-0.5">
                                Size: <span className="text-orange-600">{item.size}</span>
                              </p>
                              <p className="text-sm font-black text-neutral-700 mt-1">₹{item.price}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-neutral-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                              <div className="flex items-center gap-2.5 bg-white border border-neutral-200 rounded-lg p-0.5 shadow-sm">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-neutral-50 rounded text-neutral-500"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-black text-neutral-800">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-5 h-5 flex items-center justify-center hover:bg-neutral-50 rounded text-neutral-500"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Checkout details form */
                      <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-black text-neutral-800 uppercase tracking-wider">Delivery Details</h4>
                          <button
                            type="button"
                            onClick={() => setShowCheckout(false)}
                            className="text-xs font-bold text-orange-600 hover:underline"
                          >
                            Edit Items
                          </button>
                        </div>

                        {!auth.currentUser ? (
                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3 text-amber-800">
                            <ShieldAlert size={18} className="shrink-0 mt-0.5 animate-bounce" />
                            <div>
                              <p className="text-xs font-bold">Authentication Required</p>
                              <p className="text-[10px] text-amber-900/80 mt-0.5">Please log in or sign up first to place persistent catering orders.</p>
                              <button
                                type="button"
                                onClick={onLoginRequest}
                                className="mt-2 text-xs font-black uppercase text-orange-700 hover:underline"
                              >
                                Login now
                              </button>
                            </div>
                          </div>
                        ) : null}

                        <div className="space-y-3.5">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Receiver name"
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Phone</label>
                              <input
                                type="tel"
                                name="number"
                                required
                                value={formData.number}
                                onChange={handleInputChange}
                                placeholder="Contact number"
                                className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">WhatsApp</label>
                              <input
                                type="tel"
                                name="whatsapp"
                                required
                                value={formData.whatsapp}
                                onChange={handleInputChange}
                                placeholder="WhatsApp count"
                                className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Address</label>
                            <textarea
                              name="address"
                              required
                              rows={2}
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Complete doorstep delivery address"
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold resize-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Location region</label>
                            <select
                              name="location"
                              required
                              value={formData.location}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                            >
                              <option value="">Select Location</option>
                              {locations.map((loc) => (
                                <option key={loc} value={loc}>
                                  {loc}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Delivery Date</label>
                              <input
                                type="date"
                                name="orderDate"
                                required
                                value={formData.orderDate}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Apprx Time</label>
                              <input
                                type="time"
                                name="orderTime"
                                required
                                value={formData.orderTime}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 text-xs rounded-xl border border-neutral-200 bg-white focus:ring-1 focus:ring-orange-500 outline-none font-bold"
                              />
                            </div>
                          </div>

                          {/* Payment Modes selection */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Payment Setup</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setPaymentMethod('COD')}
                                className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                                  paymentMethod === 'COD'
                                    ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm'
                                    : 'border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                <ClipboardCheck size={14} />
                                Cash on Delivery
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentMethod('UPI')}
                                className={`p-3 border rounded-xl flex items-center justify-center gap-2 font-bold text-xs cursor-pointer transition-all ${
                                  paymentMethod === 'UPI'
                                    ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm'
                                    : 'border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                <CreditCard size={14} />
                                Book Now (UPI QR)
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting || !auth.currentUser}
                          className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                        >
                          {isSubmitting ? (
                            <>Processing order... <Loader2 size={16} className="animate-spin" /></>
                          ) : paymentMethod === 'COD' ? (
                            <>Place COD Order (₹{totalAmount})</>
                          ) : (
                            <>Generate UPI Booking (₹{totalAmount})</>
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Summary & Buttons footer */}
                  {cart.length > 0 && !showCheckout && (
                    <div className="p-6 border-t border-orange-50 bg-neutral-50/50 space-y-4">
                      <div className="space-y-1.5 text-xs text-neutral-500 font-semibold">
                        <div className="flex justify-between">
                          <span>Subtotal Items</span>
                          <span className="text-neutral-800 font-extrabold">₹{cartTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Packing charges</span>
                          <span className="text-neutral-800 font-extrabold">₹{packingCharge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery charges</span>
                          <span className="text-neutral-800 font-extrabold">₹{deliveryCharge}</span>
                        </div>
                        <div className="pt-2 border-t border-neutral-200 flex justify-between font-black text-sm text-neutral-800">
                          <span>Total Amount</span>
                          <span className="text-orange-600 text-base">₹{totalAmount}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full py-4 bg-stone-900 hover:bg-orange-600 text-white font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
