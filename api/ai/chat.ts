import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';

const firebaseConfig = {
  apiKey: "AIzaSyCGiYhVhkfLu7_YAqy02K5P9O1vvriLUfA",
  authDomain: "mithila-catering.firebaseapp.com",
  projectId: "mithila-catering",
  storageBucket: "mithila-catering.firebasestorage.app",
  messagingSenderId: "124823748394",
  appId: "1:124823748394:web:1fb7674865c60726f76853",
  measurementId: "G-G61G1L629Z"
};

// Initialize serverless-safe firebase
const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(firebaseApp);

export default async function handler(req: any, res: any) {
  // CORS Configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { orderId, messages } = req.body;
    if (!orderId || !messages || !Array.isArray(messages)) {
      console.warn('AI Chat Endpoint Warning: Missing orderId or messages parameter');
      return res.status(400).json({ error: 'Missing required orderId or messages parameter' });
    }

    console.info(`AI Chat Session started for Order Reference: #${orderId}`);

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) {
      console.error(`AI Chat Error: Order ref #${orderId} was not found in Firestore ledger`);
      return res.status(404).json({ error: 'Order reference not registered in database' });
    }

    const orderData = orderSnap.data();
    const currentStatus = orderData.status;

    // Systemprompt to guide agent through response limits and cancellation rules
    const systemInstruction = `You are the empathetic, expert AI Support Agent for Mithila Catering & Decoration Service.
You are assisting a customer regarding event order reference #${orderId}.

Here are the authentic live order details retrieved from our secure Firestore ledger:
- Reference ID: ${orderId}
- Customer Name: ${orderData.customerName || orderData.userName}
- Customer Email: ${orderData.customerEmail}
- Customer Phone: ${orderData.customerPhone || orderData.userPhone}
- Items Listed: ${JSON.stringify(orderData.items)}
- Financial Total: ₹${orderData.totalAmount}
- Payment Gateway Method: ${orderData.paymentMethod}
- Status State: ${currentStatus}
- Delivery Address: ${orderData.address}, ${orderData.location}
- Event Schedule: Date ${orderData.orderDate} at Time ${orderData.orderTime}

CRITICAL OPERATIONAL RULES:
1. Handle queries about: Order Status, Delivery Updates, Returns, Refunds, Cancellations, and Payment Issues.
2. Order Cancellation Protocol:
   - Customers may request to cancel their order.
   - You can cancel the order IF AND ONLY IF the current status is EXACTLY 'Processing'.
   - If the current status is EXACTLY 'Processing', you MUST declare that you are cancelling the order, and call the custom function utility \`cancelOrder(reason)\` right now. Do not promise cancellation without calling this function first.
   - If the current status is NOT 'Processing' (for example: Placed, Shipped, Out For Delivery, Delivered, Returned, Refunded, Cancelled, Cancelled by Payment Failure, Cancelled by Customer, or Pending Payment), you are STRICTLY FORBIDDEN from performing or initiating cancellation. You must explain politely and clearly:
     "This order can no longer be cancelled because it has already moved beyond the Processing stage."
   - If the status is already 'Cancelled by Payment Failure' or 'Cancelled by Customer', explain that the order is already permanently cancelled.
3. Be professional and humble. Do not print system variables, telemetry strings, or logs. Always reply with clean Markdown format.`;

    const genaiKey = process.env.GEMINI_API_KEY;
    if (!genaiKey) {
      console.error('AI Chat Critical Error: GEMINI_API_KEY is not defined in server environment');
      return res.status(500).json({ error: 'Gemini API Key missing in server environment variables' });
    }

    const ai = new GoogleGenAI({
      apiKey: genaiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    console.info(`Querying Gemini (gemini-3.5-flash) for Order Support with prompt count: ${messages.length}`);

    // Query Gemini Content with tools support
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        ...messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }]
        }))
      ],
      config: {
        tools: [{
          functionDeclarations: [{
            name: 'cancelOrder',
            description: 'Performs order cancellation and updates Firestore status to Cancelled by Customer.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                reason: {
                  type: Type.STRING,
                  description: 'The cancellation reason specified by the customer.'
                }
              },
              required: ['reason']
            }
          }]
        }]
      }
    });

    // Handle function calling
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'cancelOrder') {
        const args = (call.args || {}) as any;
        const reason = args.reason || 'Requested by customer';

        console.info(`Gemini triggered cancelOrder function call with reason: "${reason}"`);

        if (currentStatus === 'Processing') {
          const cancellationTime = new Date().toISOString();
          await updateDoc(orderRef, {
            status: 'Cancelled by Customer',
            cancellationReason: reason,
            cancelledAt: cancellationTime,
            aiChatLogs: arrayUnion({
              type: 'system',
              action: 'Cancelled by Customer',
              reason,
              timestamp: cancellationTime
            })
          });

          console.info(`Firestore successfully updated. Order: #${orderId} marked as 'Cancelled by Customer'`);

          // Resume content generation to confirm cancellation to user
          const confirmedResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [
              { role: 'user', parts: [{ text: systemInstruction }] },
              ...messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content || '' }]
              })),
              {
                role: 'model',
                parts: [{
                  functionCall: { name: 'cancelOrder', args: { reason } }
                }]
              },
              {
                role: 'user',
                parts: [{ text: `System action handled: The order was successfully updated to 'Cancelled by Customer' with reason "${reason}" at timestamp ${cancellationTime}. Deliver this confirmation text gracefully.` }]
              }
            ]
          });

          return res.status(200).json({
            message: confirmedResponse.text,
            statusUpdated: true,
            newStatus: 'Cancelled by Customer'
          });
        } else {
          console.warn(`Cancellation requested but denied. Status is: "${currentStatus}"`);
          return res.status(200).json({
            message: `This order can no longer be cancelled because its current status is "${currentStatus}", which is beyond the Processing stage.`,
            statusUpdated: false
          });
        }
      }
    }

    // Log regular conversation activity
    const lastMsg = messages[messages.length - 1]?.content || '';
    await updateDoc(orderRef, {
      aiChatLogs: arrayUnion({
        userQuery: lastMsg,
        aiReply: response.text,
        timestamp: new Date().toISOString()
      })
    });

    console.info(`Successfully processed conversation segment and updated logs for Order: #${orderId}`);

    return res.status(200).json({
      message: response.text,
      statusUpdated: false
    });

  } catch (error: any) {
    console.error('AI chat serverless endpoint error:', error);
    return res.status(500).json({ error: error.message || 'Error occurred handling assistant query' });
  }
}
