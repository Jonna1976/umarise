import { motion, AnimatePresence } from 'framer-motion';

export type StepStatus = 'waiting' | 'active' | 'done' | 'fail' | 'hidden';

export interface StepState {
  id: string;
  status: StepStatus;
  label: string;
}

interface VerifyProcessLogProps {
  steps: StepState[];
  visible: boolean;
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'active') {
    return <span className="inline-block w-4 text-center animate-pulse">◌</span>;
  }
  if (status === 'done') {
    return <span className="inline-block w-4 text-center">✓</span>;
  }
  if (status === 'fail') {
    return <span className="inline-block w-4 text-center">✗</span>;
  }
  return <span className="inline-block w-4 text-center">◌</span>;
}

export function VerifyProcessLog({ steps, visible }: VerifyProcessLogProps) {
  if (!visible) return null;

  return (
    <div className="mt-6 text-left">
      <AnimatePresence>
        {steps.map((step) => {
          if (step.status === 'hidden' || step.status === 'waiting') return null;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`
                flex items-center gap-2.5 py-1.5 font-mono text-[11px] font-light
                ${step.status === 'done' ? 'text-verify-green-bright' : ''}
                ${step.status === 'fail' ? 'text-verify-red' : ''}
                ${step.status === 'active' ? 'text-ritual-cream-40' : ''}
              `}
            >
              <StepIcon status={step.status} />
              <span>{step.label}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
