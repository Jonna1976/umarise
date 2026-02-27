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

  const isTestMode = new URLSearchParams(window.location.search).get('test') === 'anchored';

  const onPay = async () => {
    if (isTestMode) {
      toast.success('Test mode: attestation checkout would open here (Stripe).');
      return;
    }
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

        <p className="font-garamond text-[18px] text-center mb-4"
          style={{ color: 'rgba(240,234,214,0.6)', lineHeight: 1.55 }}>
          A notary reinforces your anchor with an independent certified statement.
        </p>

        <div className="flex items-baseline justify-between mb-4 pt-3 border-t"
          style={{ borderColor: 'rgba(201,169,110,0.1)' }}>
          <span className="font-mono text-[15px] tracking-[3px] uppercase"
            style={{ color: 'rgba(201,169,110,0.35)' }}>Total</span>
          <span className="font-garamond text-[26px]"
            style={{ color: 'rgba(201,169,110,0.7)' }}>€4.95</span>
        </div>

        <button onClick={onPay}
          disabled={redirecting}
          className="w-full py-3 rounded-full font-garamond text-[18px] disabled:opacity-40 transition-opacity"
          style={{
            border: '1px solid rgba(201,169,110,0.25)',
            background: 'rgba(201,169,110,0.06)',
            color: 'rgba(201,169,110,0.7)',
          }}>
          {redirecting ? 'Opening…' : 'Continue to payment'}
        </button>

        <p className="font-mono text-[15px] tracking-[3px] uppercase text-center mt-3"
          style={{ color: 'rgba(201,169,110,0.2)' }}>Secured by Stripe</p>
      </div>
    </div>
  );
}
