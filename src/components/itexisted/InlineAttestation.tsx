import { useState } from 'react';
import { toast } from 'sonner';
import { startAttestationCheckout } from '@/lib/coreApi';
import { getActiveDeviceId } from '@/lib/deviceId';

interface Props {
  originId: string;
  shortToken: string;
}

export default function InlineAttestation({ originId, shortToken }: Props) {
  const [redirecting, setRedirecting] = useState(false);

  const onPay = async () => {
    const deviceId = getActiveDeviceId();
    if (!deviceId) { toast.error('Device not ready.'); return; }
    setRedirecting(true);
    const checkout = await startAttestationCheckout(originId, deviceId);
    if (!checkout) { toast.error('Could not open payment.'); setRedirecting(false); return; }
    window.location.href = checkout.url;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full rounded-[8px] border p-4"
        style={{ borderColor: 'rgba(201,169,110,0.15)', background: 'rgba(201,169,110,0.03)' }}>

        <p className="font-garamond text-[14px] text-center mb-3"
          style={{ color: 'rgba(240,234,214,0.6)', lineHeight: 1.5 }}>
          A notary reinforces your anchor with an independent certified statement.
        </p>

        <div className="flex items-baseline justify-between mb-3 pt-2 border-t"
          style={{ borderColor: 'rgba(201,169,110,0.1)' }}>
          <span className="font-mono text-[8px] tracking-[2px] uppercase"
            style={{ color: 'rgba(201,169,110,0.3)' }}>Total</span>
          <span className="font-garamond text-[20px]"
            style={{ color: 'rgba(201,169,110,0.7)' }}>€4.95</span>
        </div>

        <button onClick={onPay}
          disabled={redirecting}
          className="w-full py-2.5 rounded-full font-garamond text-[15px] disabled:opacity-40 transition-opacity"
          style={{
            border: '1px solid rgba(201,169,110,0.25)',
            background: 'rgba(201,169,110,0.06)',
            color: 'rgba(201,169,110,0.7)',
          }}>
          {redirecting ? 'Opening…' : 'Continue to payment'}
        </button>

        <p className="font-mono text-[7px] tracking-[2px] uppercase text-center mt-2"
          style={{ color: 'rgba(201,169,110,0.2)' }}>Secured by Stripe</p>
      </div>
    </div>
  );
}
