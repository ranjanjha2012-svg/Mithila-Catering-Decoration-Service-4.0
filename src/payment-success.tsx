import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { doc, getDoc, updateDoc, setDoc, collection } from 'firebase/firestore';
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

        // If order status is pending payment, update it to Paid and status to Placed
        let updatedOrderData = orderData;
        if (orderData.status === 'Pending Payment') {
          await updateDoc(orderRef, {
            status: 'Placed',
            paymentStatus: 'Paid',
            paymentVerifiedAt: new Date().toISOString()
          });
          
          await logUserActivity('Order Payment Verified', { 
            orderId, 
            status: 'Placed',
            paymentStatus: 'Paid', 
            amount: orderData.totalAmount 
          });

          updatedOrderData = { ...orderData, status: 'Placed', paymentStatus: 'Paid' };
          // Refresh order status in state
          setOrder(updatedOrderData);
        }

        // Handle automated Tiffin service database creation on payment validation
        if (updatedOrderData.isTiffinOrder === true) {
          const tiffinOrderRef = doc(db, 'tiffinOrders', orderId);
          const tiffinOrderSnap = await getDoc(tiffinOrderRef);
          if (!tiffinOrderSnap.exists()) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000);
            const refId = `MTS-TF-${randomDigits}`;

            await setDoc(tiffinOrderRef, {
              id: orderId,
              orderId: orderId,
              userId: updatedOrderData.userId || '',
              customerName: updatedOrderData.customerName || 'Customer',
              phone: updatedOrderData.customerPhone || updatedOrderData.userPhone || '',
              customerEmail: updatedOrderData.customerEmail || '',
              address: updatedOrderData.address || '',
              plan: updatedOrderData.items?.[0]?.name || 'Tiffin Subscription',
              amount: updatedOrderData.totalAmount || 0,
              orderDate: updatedOrderData.orderDate || new Date().toISOString().split('T')[0],
              createdAt: updatedOrderData.createdAt || new Date().toISOString(),
              referenceId: refId,
              status: 'Pending Activation',
              paymentStatus: 'Paid',
              orderType: 'tiffin'
            });

            // Update main orders document with Tiffin Reference ID and state
            try {
              const mainOrderRef = doc(db, 'orders', orderId);
              await updateDoc(mainOrderRef, {
                referenceId: refId,
                tiffinReferenceId: refId,
                tiffinStatus: 'Pending Activation',
                orderType: 'tiffin'
              });
            } catch (upErr) {
              console.error("Error updating parent order with reference ID:", upErr);
            }

            // Save Reference ID in customer profile
            try {
              const uId = updatedOrderData.userId;
              if (uId) {
                const userRef = doc(db, 'users', uId);
                await updateDoc(userRef, {
                  tiffinReferenceId: refId,
                  tiffinStatus: 'Pending Activation'
                });
              }
            } catch (uErr) {
              console.error("Error updating customer profile with reference ID:", uErr);
            }

            // Trigger Tiffin Purchase Formspree and Gmail Email Notification
            try {
              await fetch('https://formspree.io/f/xwvjljzp', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  subject: `NEW TIFFIN SUBSCRIPTION PURCHASE - Reference ID #${refId}`,
                  customerName: updatedOrderData.customerName || 'Customer',
                  phoneNumber: updatedOrderData.customerPhone || updatedOrderData.userPhone || 'N/A',
                  email: updatedOrderData.customerEmail || 'N/A',
                  address: updatedOrderData.address || 'N/A',
                  planName: updatedOrderData.items?.[0]?.name || 'Tiffin Subscription',
                  amountPaid: `₹${updatedOrderData.totalAmount || 0}`,
                  paymentMethod: 'Pay Online',
                  paymentStatus: 'Paid Successfully',
                  purchaseDate: updatedOrderData.orderDate || new Date().toISOString().split('T')[0],
                  purchaseTime: updatedOrderData.orderTime || new Date().toTimeString().split(' ')[0],
                  generatedReferenceId: refId,
                  recipient: 'mithilacateringservices@gmail.com'
                })
              });
            } catch (emailErr) {
              console.error("Error triggering Tiffin Purchase notification:", emailErr);
            }
            setOrder((prev: any) => prev ? { ...prev, referenceId: refId } : null);
          }
        }

        // Send Formspree email notification for successful Online Payment placement
        if (
          (updatedOrderData.status === 'Placed' || updatedOrderData.paymentStatus === 'Paid') &&
          updatedOrderData.isNotificationSent !== true
        ) {
          try {
            const itemsText = (updatedOrderData.items || []).map((i: any, index: number) => 
              `${index + 1}. ${i.name} (${i.size}) x${i.quantity} [₹${i.total || i.price * i.quantity}]`
            ).join('\n');
            const totalQty = (updatedOrderData.items || []).reduce((sum: number, i: any) => sum + i.quantity, 0);

            await fetch('https://formspree.io/f/mbdedvab', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                subject: `New Online Paid Order - #${orderId}`,
                customerName: updatedOrderData.customerName || updatedOrderData.userName || 'Customer',
                phoneNumber: updatedOrderData.customerPhone || updatedOrderData.userPhone || 'N/A',
                address: updatedOrderData.address || 'N/A',
                area: updatedOrderData.location || updatedOrderData.state || 'N/A',
                orderedItems: itemsText,
                quantity: totalQty,
                totalAmount: `₹${updatedOrderData.totalAmount}`,
                paymentMethod: 'Pay Online',
                paymentStatus: 'Paid Successfully',
                orderDate: updatedOrderData.orderDate || new Date().toISOString().split('T')[0],
                orderTime: updatedOrderData.orderTime || new Date().toTimeString().split(' ')[0]
              })
            });

            await updateDoc(orderRef, {
              isNotificationSent: true
            });

            setOrder((prev: any) => prev ? { ...prev, isNotificationSent: true } : null);
          } catch (emailErr) {
            console.error("Error sending PayU success Formspree email:", emailErr);
          }
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
              <p className="text-[10px] font-black tracking-widest text-[#800000] uppercase">Order Reference</p>
              <h3 className="text-lg font-black text-stone-800 font-mono mt-0.5">#{orderId}</h3>
            </div>
            <div className="sm:text-right">
              <p className="text-[10px] font-black tracking-widest text-stone-400 uppercase">Payment Status</p>
              <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded-full uppercase mt-1">
                Paid Successfully
              </span>
            </div>
          </div>

          {/* Tiffin Reference Card for immediate visibility & copy option */}
          {(order.isTiffinOrder || order.referenceId) && (
            <div className="bg-red-50 border border-[#800000]/20 rounded-2xl p-6 text-center text-stone-900 space-y-3 shadow-inner my-4">
              <span className="text-[10px] font-black uppercase text-stone-500 tracking-wider block">Generated Tiffin Subscription Reference ID</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black text-[#800000] tracking-wider select-all">{order.referenceId || "MTS-TF-PENDING"}</span>
                {order.referenceId && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.referenceId);
                      alert('Reference Subscription ID copied to clipboard: ' + order.referenceId);
                    }}
                    className="px-3 py-1 bg-[#800000] text-white rounded-md hover:bg-black transition-colors text-xs font-bold cursor-pointer"
                    id="copy-tiffin-ref-btn"
                  >
                    Copy
                  </button>
                )}
              </div>
              <p className="text-[11px] text-stone-600 font-bold max-w-md mx-auto leading-normal">
                This key is required to log operational status updates. Keep it saved! You can track your meal deliveries in real-time under the <strong>My Orders</strong> section.
              </p>
            </div>
          )}

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
              <span className="text-stone-800">₹{order.packingCharge !== undefined ? order.packingCharge : 12}</span>
            </div>
            <div className="flex justify-between">
              <span>Doorstep Delivery charges</span>
              <span className="text-stone-800">₹{order.deliveryCharge !== undefined ? order.deliveryCharge : 40}</span>
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
