'use client';

import { useState, useCallback, useEffect } from 'react';
import { RiskEstimationBox } from '../../components/risk-estimation-box';
import { calRisk } from './calRisk';

export default function EstimatePage() {
  const [calRiskData, setCalRiskData] = useState([]);
  const [calculatedRisk, setCalculatedRisk] = useState(0);
  const [riskMater, setRiskMater] = useState('');

  // Effect hook to automatically calculate risk when `calRiskData` changes
  useEffect(() => {
    if (calRiskData.length > 0) {
      setRiskMater(calRiskData[0].partner);
      // Automatically calculate risk
      calculateRisk();
    }
  }, [calRiskData]);

  // Handle changes in the input data for risk calculation
  const handleCalRiskDataChange = useCallback((newCalRiskData) => {
    setCalRiskData(newCalRiskData);
  }, []);

  // Function to calculate the risk based on the provided data
  const calculateRisk = useCallback(() => {
    if (calRiskData.length > 0) {
      const data = calRiskData[0];
      const risk = calRisk(
        data.partner,
        data.act,
        data.PrEP,
        data.prot,
        data.ART_UVL,
        data.acute_hiv_infection_hiv_positive_partner,
        data.std_infection_hiv_negative_partner,
        data.std_infection_hiv_positive_partner
      );
      setCalculatedRisk(risk);
      console.log('Calculated Risk:', risk);
    }
  }, [calRiskData]);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {riskMater ? (
        <h1 className="text-4xl font-bold text-center mb-12">โอกาสที่คู่นอนของคุณจะติดเชื้อจากคุณคือ... {calculatedRisk}</h1>
      ) :
        (
          <h1 className="text-4xl font-bold text-center mb-12">โอกาสที่คุณจะติดเชื้อจากคู่นอนของคุณคือ... {calculatedRisk}</h1>
        )
      }
      <RiskEstimationBox onCalRiskDataChange={handleCalRiskDataChange} />
      <button
        className="fixed right-10 bottom-8 w-[5.2rem] h-[5.2rem] bg-green-600 text-white font-semibold rounded-full shadow-md hover:bg-green-700 transition duration-200 flex items-center justify-center"
        onClick={calculateRisk}
        aria-label="Calculate Risk"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )
}