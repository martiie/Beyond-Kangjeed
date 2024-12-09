import { Box } from 'lucide-react';
import React from 'react';

export function RiskMeter({ calculatedRisk, maxRisk = (7026/4) }) {
  // Calculate percentage (0-100) based on risk value
  const riskPercentage = Math.min((calculatedRisk / maxRisk) * 100, 100);

  // Determine the risk level and color
  const getRiskLevel = (percentage) => {
    if (percentage <= 25) return { level: 'ต่ำ', color: 'from-emerald-500 to-emerald-400', textColor: 'text-emerald-600' };
    if (percentage <= 50) return { level: 'ปานกลาง', color: 'from-yellow-500 to-yellow-400', textColor: 'text-yellow-600' };
    if (percentage <= 75) return { level: 'สูง', color: 'from-orange-500 to-orange-400', textColor: 'text-orange-600' };
    return { level: 'สูงมาก', color: 'from-red-600 to-red-500', textColor: 'text-red-600' };
  };

  const { level, color, textColor } = getRiskLevel(riskPercentage);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 mb-8 rounded-xl">
      <div className="mb-4 text-center">
        <span className="text-2xl font-semibold text-gray-800">ระดับความเสี่ยง: </span>
        <span className={`text-3xl font-bold ${textColor}`}>{level}</span>
      </div>
      <div className="mb-6 text-center text-lg text-gray-600">
        ค่าความเสี่ยง: <span className="font-semibold">{calculatedRisk.toLocaleString()}</span>
      </div>        
      <div className="relative h-10 rounded-full overflow-hidden border" style={{boxShadow: '0px 0px 4px 2px rgb(0, 0, 0, 0.065'}}>
        <div
          className={`h-full ${color} transition-all duration-500 ease-out bg-gradient-to-r`}
          style={{ width: `${riskPercentage}%` }}
          role="progressbar"
          aria-valuenow={calculatedRisk}
          aria-valuemin={0}
          aria-valuemax={maxRisk}
        />
      </div>
      <div className="flex justify-between mt-3 text-base font-medium text-gray-700">
        <span>ต่ำ</span>
        <span>ปานกลาง</span>
        <span>สูง</span>
        <span>สูงมาก</span>
      </div>
    </div>
  );
}

