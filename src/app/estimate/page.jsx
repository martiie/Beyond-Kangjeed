'use client';

import { useState, useCallback, useEffect } from 'react';
import { RiskEstimationBox } from '../../components/risk-estimation-box';
import { calRisk } from './calRisk';
import { RiskMeter } from '../../components/risk-mater';

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
      console.log('Calculated Risk:', risk, calRiskData[0]);
    }
  }, [calRiskData]);

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <RiskMeter calculatedRisk={calculatedRisk} riskData={calRiskData} />
      <RiskEstimationBox onCalRiskDataChange={handleCalRiskDataChange} />
    </div>
  )
}