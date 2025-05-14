import { AnimatePresence, cubicBezier, motion } from 'framer-motion';

export interface SendButtonProps {
  isStreaming?: boolean;
  isEnhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onClickAiPreview?: () => void;
}

const customEasingFn = cubicBezier(0.4, 0, 0.2, 1);

export function SendButton({ 
  isStreaming, 
  isEnhancingPrompt, 
  promptEnhanced, 
  disabled = false,
  onClick,
  onClickAiPreview
}: SendButtonProps) {
  return (
    <AnimatePresence>
      <motion.button
        className="flex justify-center items-center p-1 bg-accent-500 hover:brightness-94 color-white rounded-md w-[34px] h-[34px] transition-theme disabled:opacity-50 disabled:cursor-not-allowed"
        transition={{ ease: customEasingFn, duration: 0.17 }}
        disabled={disabled}
        onClick={(event) => {
          event.preventDefault();
          onClick?.(event);
        }}
      >
        <div className="text-lg">
          {!isStreaming ? <div className="i-ph:arrow-right"></div> : <div className="i-ph:stop-circle-bold"></div>}
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
