import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ShieldAlert, RefreshCw, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { db, auth, logUserActivity } from './lib/firebase';
import CateringRoot from './components/CateringRoot';
import './index.css';

function PaymentFailureScreen() {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const queryParams = new URLSearchParams(window.location.search);
  const orderId = queryParams.get('orderId') || '';
  const gatewayMsg = queryParams.get('msg') || 'Transaction was declined by PayU India or issuing bank.';

  useEffect(() => {
    async function processFailedPayment() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(orderRef);

        if (docSnap.exists()) {
          const orderData = docSnap.data();
          setOrder(orderData);

          // Update the order's status to Cancelled by Payment Failure if it was Pending Payment
          if (orderData.status === 'Pending Payment') {
            await updateDoc(orderRef, {
              status: 'Cancelled by Payment Failure',
              paymentStatus: 'Failed',
              locked: true,
              isPermanentCancellation: true,
              paymentFailureReason: gatewayMsg,
              cancelledAt: new Date().toISOString()
            });

            await logUserActivity('Order Payment Failed', {
              orderId,
              status: 'Cancelled by Payment Failure',
              paymentStatus: 'Failed',
              error: gatewayMsg
            });
            
            // Sync status to state
            setOrder((prev: any) => prev ? { 
              ...prev, 
              status: 'Cancelled by Payment Failure',
              paymentStatus: 'Failed',
              locked: true,
              isPermanentCancellation: true
            } : null);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error updating failed payment order state:', err);
        setLoading(false);
      }
    }

    processFailedPayment();
  }, [orderId, gatewayMsg]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <h3 className="text-lg font-black text-stone-800">Processing Failed Transaction State...</h3>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden transform transition-all">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-3 backdrop-blur-xs">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">Payment Failed</h2>
          <p className="text-red-50 text-sm mt-1 font-medium">Your online transaction could not be processed completely.</p>
        </div>

        {/* Failure body details */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-stone-400 font-extrabold uppercase tracking-widest font-mono">Invoice Reference</p>
            <p className="text-lg text-stone-800 font-black font-mono">#{orderId || 'N/A'}</p>
          </div>

          <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-red-800 mb-1">Decline Reason</h4>
            <p className="text-xs text-red-950 font-medium leading-relaxed">
              {gatewayMsg || 'Transaction timed out, was aborted, or rejected by provider.'}
            </p>
          </div>

          {order && (
            <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100/50 text-xs font-bold text-stone-700 space-y-2">
              <div className="flex justify-between">
                <span>Catering Total Amount</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Target Gateway</span>
                <span className="text-orange-600 uppercase font-extrabold">PayU India</span>
              </div>
              <div className="flex justify-between">
                <span>Order Status update</span>
                <span className="text-red-600 uppercase font-extrabold text-[10px]">Permanently Cancelled - Payment Failed</span>
              </div>
            </div>
          )}

          <div className="text-center font-medium py-2">
            <p className="text-xs text-stone-500 leading-relaxed">
              Don't worry! Your cart selection has been <strong>safely preserved</strong>. You can return directly to menu drawer to retry payment, or secure booking via <strong>Cash on Delivery (COD)</strong> instead!
            </p>
          </div>

          {/* Call to actions */}
          <div className="pt-4 space-y-3">
            <a
              href="/order.html"
              className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-md flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] transition-all cursor-pointer active:scale-98"
            >
              <RefreshCw size={15} />
              Retry Payment / Checkout
            </a>

            <a
              href="/order.html"
              className="w-full py-4 border-2 border-stone-200 hover:bg-stone-100 text-stone-800 font-black rounded-2xl text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back To Food Menu
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CateringRoot>
      <PaymentFailureScreen />
    </CateringRoot>
  </React.StrictMode>
);
