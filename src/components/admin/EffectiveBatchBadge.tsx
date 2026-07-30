import React from 'react';

interface EffectiveBatchBadgeProps {
  isTransferred: boolean;
  effectiveBatchName: string;
  originalBatchName?: string;
  validTill?: string;
}

const EffectiveBatchBadge: React.FC<EffectiveBatchBadgeProps> = ({
  isTransferred,
  effectiveBatchName,
  originalBatchName,
  validTill
}) => {
  if (isTransferred) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black rounded-lg uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          Temporary: {effectiveBatchName}
        </span>
        {originalBatchName && (
          <span className="text-[10px] text-slate-400 font-semibold">
            Original: {originalBatchName} {validTill && `(till ${validTill})`}
          </span>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg">
      {effectiveBatchName}
    </span>
  );
};

export default EffectiveBatchBadge;
