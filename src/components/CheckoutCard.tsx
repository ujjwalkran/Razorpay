import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, CreditCard, Globe2, LockKeyhole, QrCode, RefreshCw, XCircle } from 'lucide-react';
import { banks } from '../data/gateway';
import type { PaymentMethod, PaymentResult, Transaction } from '../types/payment';

type CheckoutCardProps = {
  onTransaction: (transaction: Transaction) => void;
};

type Errors = Partial<Record<'upiId' | 'cardNumber' | 'cardName' | 'expiry' | 'cvv' | 'bank', string>>;

const methodLabels: Record<PaymentMethod, string> = {
  upi: 'UPI',
  card: 'Card',
  bank: 'Bank',
};

const amount = '₹12,499';

export function CheckoutCard({ onTransaction }: CheckoutCardProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('customer@upi');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState('Nova Customer');
  const [expiry, setExpiry] = useState('12/29');
  const [cvv, setCvv] = useState('123');
  const [bank, setBank] = useState(banks[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const helperText = useMemo(() => {
    if (method === 'upi') return 'Enter a valid UPI ID such as name@bank.';
    if (method === 'card') return 'Use the demo card to simulate a successful authorization.';
    return 'Choose a bank to simulate a redirect and capture.';
  }, [method]);

  const validate = () => {
    const nextErrors: Errors = {};

    if (method === 'upi' && !/^[\w.-]{2,}@[\w.-]{2,}$/.test(upiId.trim())) {
      nextErrors.upiId = 'Enter a valid UPI ID.';
    }

    if (method === 'card') {
      const digits = cardNumber.replace(/\D/g, '');
      if (digits.length < 13 || digits.length > 19) nextErrors.cardNumber = 'Enter a valid card number.';
      if (cardName.trim().length < 3) nextErrors.cardName = 'Enter the cardholder name.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.trim())) nextErrors.expiry = 'Use MM/YY format.';
      if (!/^\d{3,4}$/.test(cvv.trim())) nextErrors.cvv = 'Enter a 3 or 4 digit CVV.';
    }

    if (method === 'bank' && !bank) nextErrors.bank = 'Select a bank.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(null);

    if (!validate()) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      const isFailure = method === 'card' && cardNumber.replace(/\D/g, '').endsWith('0000');
      const reference = `pay_PB${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const status = isFailure ? 'Failed' : 'Captured';

      onTransaction({
        id: reference,
        customer: method === 'card' ? cardName : 'Demo Customer',
        method: methodLabels[method],
        amount,
        status,
      });

      setResult({
        status: isFailure ? 'failure' : 'success',
        title: isFailure ? 'Payment failed' : 'Payment captured',
        message: isFailure
          ? 'The mock processor declined this card. Try another method or remove the 0000 ending.'
          : `${methodLabels[method]} payment completed in sandbox mode.`,
        reference,
      });
      setIsSubmitting(false);
    }, 850);
  };

  return (
    <div className="checkout-card" id="checkout" aria-label="Demo checkout card">
      <div className="checkout-header">
        <div>
          <span className="muted">Merchant</span>
          <h2>Nova Commerce</h2>
        </div>
        <span className="secure"><LockKeyhole size={14} /> Secure</span>
      </div>
      <div className="amount-box">
        <span>Total payable</span>
        <strong>{amount}</strong>
      </div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="payment-tabs" role="tablist" aria-label="Payment method">
          <button className={method === 'upi' ? 'active' : undefined} onClick={() => setMethod('upi')} type="button"><QrCode size={16} /> UPI</button>
          <button className={method === 'card' ? 'active' : undefined} onClick={() => setMethod('card')} type="button"><CreditCard size={16} /> Card</button>
          <button className={method === 'bank' ? 'active' : undefined} onClick={() => setMethod('bank')} type="button"><Globe2 size={16} /> Bank</button>
        </div>

        {method === 'upi' && (
          <label className="field">
            UPI ID
            <input aria-invalid={Boolean(errors.upiId)} aria-label="Demo UPI ID" onChange={(event) => setUpiId(event.target.value)} value={upiId} />
            {errors.upiId && <span className="error-text">{errors.upiId}</span>}
          </label>
        )}

        {method === 'card' && (
          <div className="form-grid">
            <label className="field full-width">
              Card number
              <input aria-invalid={Boolean(errors.cardNumber)} inputMode="numeric" onChange={(event) => setCardNumber(event.target.value)} value={cardNumber} />
              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
            </label>
            <label className="field full-width">
              Cardholder name
              <input aria-invalid={Boolean(errors.cardName)} onChange={(event) => setCardName(event.target.value)} value={cardName} />
              {errors.cardName && <span className="error-text">{errors.cardName}</span>}
            </label>
            <label className="field">
              Expiry
              <input aria-invalid={Boolean(errors.expiry)} onChange={(event) => setExpiry(event.target.value)} placeholder="MM/YY" value={expiry} />
              {errors.expiry && <span className="error-text">{errors.expiry}</span>}
            </label>
            <label className="field">
              CVV
              <input aria-invalid={Boolean(errors.cvv)} inputMode="numeric" onChange={(event) => setCvv(event.target.value)} value={cvv} />
              {errors.cvv && <span className="error-text">{errors.cvv}</span>}
            </label>
          </div>
        )}

        {method === 'bank' && (
          <label className="field">
            Select bank
            <select aria-invalid={Boolean(errors.bank)} onChange={(event) => setBank(event.target.value)} value={bank}>
              {banks.map((bankName) => <option key={bankName}>{bankName}</option>)}
            </select>
            {errors.bank && <span className="error-text">{errors.bank}</span>}
          </label>
        )}

        <p className="helper-text">{helperText}</p>
        <button className="pay-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? <><RefreshCw className="spin" size={18} /> Processing...</> : `Pay ${amount}`}
        </button>
      </form>

      {result && (
        <div className={`payment-result ${result.status}`} role="status">
          {result.status === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div>
            <strong>{result.title}</strong>
            <span>{result.message}</span>
            <small>{result.reference}</small>
          </div>
        </div>
      )}
      <p className="fine-print">This is a front-end prototype. Connect a compliant backend before processing real money.</p>
    </div>
  );
}
