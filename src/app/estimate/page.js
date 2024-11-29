import { RiskEstimationBox } from '@/components/risk-estimation-box'

export default function EstimatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-12">HIV Risk Estimation</h1>
      <RiskEstimationBox />
      {/* Uncomment and adjust as needed
      {risk !== null && (
        <div className="mt-8">
          <p className="text-center font-bold text-gray-800">Calculated Risk: {risk}</p>
          <div className="risk-bar-container mt-4">
            <span className="label-left">ความเสี่ยงต่ำ</span>
            <div className="risk-bar"></div>
            <span className="label-right">ความเสี่ยงสูง</span>
          </div>
        </div>
      )}
      */}
    </div>
  )
}

