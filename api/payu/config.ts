export default function handler(req: any, res: any) {
  const payuKey = process.env.PAYU_KEY || "Xu4Xc9"; // Fallback to provided production Key
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ payuKey });
}
