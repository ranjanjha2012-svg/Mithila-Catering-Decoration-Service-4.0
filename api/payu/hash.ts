import crypto from 'crypto';

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { txnid, amount, productinfo, firstname, email } = req.body;

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const key = process.env.PAYU_KEY || "Xu4Xc9"; // Fallback to provided production Key
    const salt = process.env.PAYU_SALT || "ySIviBMeitterrHjVqR05JqqEYmaIIal"; // Fallback to provided production Salt

    // Hash formula: key|txnid|amount|productinfo|firstname|email|||||||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    res.status(200).json({ hash });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
