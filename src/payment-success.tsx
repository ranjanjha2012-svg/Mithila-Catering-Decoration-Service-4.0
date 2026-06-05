import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { CheckCircle2, Send, Calendar, MapPin, Phone, ShoppingBag, Loader2 } from 'lucide-react';
import { db, auth, logUserActivity, OperationType, handleFirestoreError } from './lib/firebase';
import CateringRoot from './components/CateringRoot';
import { useCart } from './context/CartContext';
import './index.css';

function PaymentSuccessScreen() {
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(window.location.search);
  const orderId = queryParams.get('orderId') || '';
  const amount = queryParams.get('amount') || '';

  useEffect(() => {
    async function processOrderPayment() {
      if (!orderId) {
        setError('Missing order transaction reference.');
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(orderRef);

        if (!docSnap.exists()) {
          setError(`Order Reference #${orderId} was not found.`);
          setLoading(false);
          return;
        }

        const orderData = docSnap.data();
        setOrder(orderData);

        // If order status is pending payment, update it to Paid
        if (orderData.status === 'Pending Payment') {
          await updateDoc(orderRef, {
            status: 'Paid',
            paymentVerifiedAt: new Date().toISOString()
          });
          
          await logUserActivity('Order Payment Verified', { 
            orderId, 
            status: 'Paid', 
            amount: orderData.totalAmount 
          });

          // Refresh order status in state
          setOrder((prev: any) => prev ? { ...prev, status: 'Paid' } : null);
        }

        // Execution of cart clearing on payment completion
        clearCart();
        setLoading(false);
      } catch (err) {
        console.error('Error processing success payment:', err);
        setError('Failed to securely update order details in database.');
        setLoading(false);
      }
    }

    processOrderPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <h3 className="text-lg font-black text-stone-800">Verifying Payment Transaction...</h3>
        <p className="text-sm text-stone-500 mt-1">Please wait while we confirm your catering credentials securely.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={28} />
        </div>
        <h3 className="text-xl font-black text-stone-800">Processing Error</h3>
        <p className="text-sm text-red-600 mt-2 max-w-md">{error || 'An unexpected error occurred.'}</p>
        <a
          href="/order.html"
          className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
        >
          Return to Ordering
        </a>
      </div>
    );
  }

  // Construct WhatsApp text for sharing
  const itemsListString = order.items
    ? order.items.map((i: any) => `• ${i.name} (${i.size}) x${i.quantity}`).join('\n')
    : '';

  const whatsappText = `Namaste Mithila Catering! I have just made online payment for order *#${orderId}* of ₹${order.totalAmount}.
  
*Order Details:*
${itemsListString}

*Delivery Details:*
*Name:* ${order.customerName || order.userName}
*Phone:* ${order.customerPhone || order.userPhone}
*WhatsApp:* ${order.whatsapp || 'N/A'}
*Address:* ${order.address}
*Payment Status:* PAID (via Online Gateway)

Please initiate the kitchen preparation immediately.`;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden transform transition-all">
        {/* Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white relative">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-3 backdrop-blur-xs">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Payment Successful!</h2>
          <p className="text-green-50 text-sm mt-1 font-medium">Your catering details are secured in our active queue.</p>
        </div>

        {/* Invoice Summary */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between border-b border-stone-100 pb-6 gap-4">
            <div>
              <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Order Reference</p>
              <h3 className="text-lg font-black text-stone-800 font-mono mt-0.5">#{orderId}</h3>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Payment Status</p>
              <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase mt-1">
                Paid Successfully
              </span>
            </div>
          </div>

          {/* Delivery & Schedule Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-5 rounded-2xl border border-stone-100/50 text-xs text-stone-600 font-medium">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <strong>Date:</strong> {order.orderDate} | <strong>Time:</strong> {order.orderTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                <span>
                  <strong>Deliver To:</strong> {order.customerName} ({order.customerPhone})
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>
                <strong>Doorstep Address:</strong> {order.address}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-3">Items list</h4>
            <div className="divide-y divide-stone-100">
              {order.items &&
                order.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-xs font-semibold">
                    <div className="min-w-0 pr-4">
                      <p className="text-stone-800 font-bold truncate">
                        {item.name} <span className="text-orange-600 text-[10px] ml-1">({item.size})</span>
                      </p>
                      <p className="text-stone-400 text-[10px]">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-stone-700 font-bold">₹{item.total || item.price * item.quantity}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-stone-100 pt-5 space-y-2 text-xs font-semibold text-stone-500">
            <div className="flex justify-between">
              <span>Catering Subtotal</span>
              <span className="text-stone-800">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Packing & Sanitation charges</span>
              <span className="text-stone-800">₹{order.packingCharge || 12}</span>
            </div>
            <div className="flex justify-between">
              <span>Doorstep Delivery charges</span>
              <span className="text-stone-800">₹{order.deliveryCharge || 40}</span>
            </div>
            <div className="pt-3 border-t border-stone-100 flex justify-between font-black text-stone-800 text-sm">
              <span className="uppercase tracking-wider">Total Paid</span>
              <span className="text-orange-600 text-base">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="pt-6 space-y-4">
            <a
              href={`https://wa.me/919650254164?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-md flex items-center justify-center gap-2.5 uppercase tracking-widest text-[11px] transition-all cursor-pointer active:scale-98"
            >
              <Send size={16} />
              Share Order to WhatsApp
            </a>

            <div className="grid grid-cols-2 gap-4">
              <a
                href="/order.html"
                className="py-4 border-2 border-stone-200 hover:bg-stone-50 text-stone-700 font-black rounded-2xl text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer"
              >
                Back To Kitchen Menu
              </a>
              <a
                href="/dashboard.html"
                className="py-4 bg-stone-900 hover:bg-stone-800 text-white font-black rounded-2xl text-[10px] uppercase tracking-wider text-center transition-all cursor-pointer shadow-sm"
              >
                My Orders Panel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CateringRoot>
      <PaymentSuccessScreen />
    </CateringRoot>
  </React.StrictMode>
);
