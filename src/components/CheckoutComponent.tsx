import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjusted path to fit your directory structure

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutComponentProps {
  cartItems: CartItem[];
  cartSubtotal: number;
  appliedDiscount: number;
  calculatedTax: number;
  finalTotal: number;
  existingCODHandler: () => Promise<void>;
}

export const CheckoutComponent: React.FC<CheckoutComponentProps> = ({
  cartItems,
  cartSubtotal,
  appliedDiscount,
  calculatedTax,
  finalTotal,
  existingCODHandler,
}) => {
  const [paymentType, setPaymentType] = useState<'COD' | 'ONLINE'>('COD');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // PayU Production Setup Parameters
  const payuConfig = {
    key: "Xu4Xc9",
    salt: "ySIviBMeitterrHjVqR05JqqEYmaIIal",
    merchantName: "LUXEMARKET",
    description: "Order Payment",
    actionUrl: "https://secure.payu.in/_payment", // Live Production API Route
    surl: `${window.location.origin}/payment-success`, // Redirect target routes
    furl: `${window.location.origin}/payment-failure`
  };

  // Helper function to generate SHA-512 hashes natively in the browser as a lowercase hex string
  const generateSha512 = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePayUPayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Re-fetch current user context directly from current Supabase session
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        alert("Authentication failed. Please log in to complete your transaction.");
        setIsProcessing(false);
        return;
      }
      const user = userData.user;

      // 2. Map payload properties required for generating a valid PayU checkout string
      const txnid = `TXN_${Date.now()}`;
      const amountStr = finalTotal.toFixed(2);
      const productinfo = payuConfig.description;
      const firstname = user.user_metadata?.full_name || user.user_metadata?.name || "Customer";
      const email = user.email || "info@mithilacatering.com";
      const phone = user.user_metadata?.phone || "0000000000";

      /* PayU Standard Hash Sequence Blueprint: 
        sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
      */
      const hashSequence = `${payuConfig.key}|${txnid}|${amountStr}|${productinfo}|${firstname}|${email}|||||||||||${payuConfig.salt}`;
      const secureHash = await generateSha512(hashSequence);

      // 3. Complete database insertion into Supabase order grid prior to redirection 
      const { error: dbError } = await supabase.from('orders').insert([
        {
          customer_id: user.id,
          products: cartItems,
          subtotal: cartSubtotal,
          discount: appliedDiscount,
          tax: calculatedTax,
          total_amount: finalTotal,
          payment_type: 'ONLINE',
          status: 'paid' // Automatically registered into database for direct monitoring panels
        }
      ]);

      if (dbError) {
        console.error("Supabase Order Log Interrupted:", dbError.message);
        alert(`Order processing failed: ${dbError.message}`);
        setIsProcessing(false);
        return;
      }

      // 4. Construct temporary hidden form element to trigger PayU's Web Checkout interface
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payuConfig.actionUrl;

      const payload: Record<string, string> = {
        key: payuConfig.key,
        txnid: txnid,
        amount: amountStr,
        productinfo: productinfo,
        firstname: firstname,
        email: email,
        phone: phone,
        surl: payuConfig.surl,
        furl: payuConfig.furl,
        hash: secureHash,
        service_provider: "payu_paisa"
      };

      Object.entries(payload).forEach(([key, val]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (err) {
      console.error("Payment Lifecycle Error:", err);
      setIsProcessing(false);
    }
  };

  const processCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentType === 'COD') {
      await existingCODHandler(); // Run untouched historical cash logic 
    } else {
      await handlePayUPayment(); // Run modern automated online processing
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl max-w-xl mx-auto space-y-6">
      <div className="border-b border-stone-100 pb-4">
        <h2 className="text-xl font-black text-stone-900 tracking-tight">Checkout</h2>
        <p className="text-xs text-stone-400 mt-1 uppercase tracking-wider font-mono">Secure Gateway Gateway Port</p>
      </div>

      <form onSubmit={processCheckoutSubmit} className="space-y-6">
        
        {/* Payment Selection Form Section Injection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Select Payment Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label 
              htmlFor="payment-cod"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentType === 'COD' 
                  ? 'border-orange-500 bg-orange-50/50 text-stone-900' 
                  : 'border-stone-100 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <input
                type="radio"
                id="payment-cod"
                name="paymentType"
                value="COD"
                checked={paymentType === 'COD'}
                onChange={() => setPaymentType('COD')}
                disabled={isProcessing}
                className="accent-orange-500 h-4 w-4"
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm">Cash on Delivery</span>
                <span className="text-[10px] text-stone-400 font-bold mt-0.5">Pay in cash during catering collection</span>
              </div>
            </label>

            <label 
              htmlFor="payment-online"
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentType === 'ONLINE' 
                  ? 'border-orange-500 bg-orange-50/50 text-stone-900' 
                  : 'border-stone-100 hover:bg-stone-50 text-stone-600'
              }`}
            >
              <input
                type="radio"
                id="payment-online"
                name="paymentType"
                value="ONLINE"
                checked={paymentType === 'ONLINE'}
                onChange={() => setPaymentType('ONLINE')}
                disabled={isProcessing}
                className="accent-orange-500 h-4 w-4"
              />
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm">Online Gateway (PayU)</span>
                <span className="text-[10px] text-stone-400 font-bold mt-0.5">Debit/Credit Card, UPI, NetBanking</span>
              </div>
            </label>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100/50 space-y-2 text-xs font-bold text-stone-500">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="text-stone-800">₹{cartSubtotal.toFixed(2)}</span>
          </div>
          {appliedDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Applied Discount</span>
              <span>-₹{appliedDiscount.toFixed(2)}</span>
            </div>
          )}
          {calculatedTax > 0 && (
            <div className="flex justify-between">
              <span>Estimated Tax</span>
              <span className="text-stone-800">₹{calculatedTax.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-stone-200/60 flex justify-between text-sm font-black text-stone-900">
            <span>Payable Amount</span>
            <span className="text-orange-600 text-base">₹{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Dynamic Context Submission Button */}
        <button 
          type="submit" 
          disabled={isProcessing}
          className="w-full flex items-center justify-center py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-400 text-white font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest text-xs cursor-pointer active:scale-[0.99]"
        >
          {isProcessing ? "Processing Security Bridge..." : `Complete Order (₹${finalTotal.toFixed(2)})`}
        </button>
      </form>
    </div>
  );
};
