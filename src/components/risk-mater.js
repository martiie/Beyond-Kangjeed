import React from 'react';

export function RiskMeter({ calculatedRisk, maxRisk = 7026/4 }) {
  // Calculate percentage (0-100) based on risk value
  const riskPercentage = Math.min((calculatedRisk / maxRisk) * 100, 100);

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="flex justify-between mb-2 font-medium">
        <span>ความเสี่ยงต่ำ</span>
        <span>ความเสี่ยงสูง</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 transition-all duration-500 ease-out"
          style={{ width: `${riskPercentage}%` }}
          role="progressbar"
          aria-valuenow={calculatedRisk}
          aria-valuemin={0}
          aria-valuemax={maxRisk}
        />
      </div>
      <div className="mt-2 text-center text-sm text-gray-600">
        ค่าความเสี่ยง: {calculatedRisk.toLocaleString()}
      </div>
    </div>
  );
}
