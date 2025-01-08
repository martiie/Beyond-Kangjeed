import { Box } from 'lucide-react';
import React from 'react';

export function RiskMeter({ calculatedRisk, maxRisk = 7026 }) {
  // Calculate percentage (0-100) based on risk value
  // const riskPercentage = Math.min((calculatedRisk / maxRisk) * 100, 100);

  // Determine the risk level and color
  const getRiskLevel = (percentage) => {
    if (percentage <= 4)
      return { level: 'ต่ำ', color: 'from-emerald-500 to-emerald-400', textColor: 'text-emerald-600', range: (calculatedRisk / 4) * 25,
        advice: 'แม้ความเสี่ยงจะต่ำ แต่ควรดูแลสุขภาพด้วยการตรวจหาเชื้อ HIV และโรคติดต่อทางเพศสัมพันธ์ทุก 6 เดือน หรือทันทีเมื่อมีพฤติกรรมเสี่ยง การใช้ถุงยางอนามัยอย่างสม่ำเสมอและหลีกเลี่ยงพฤติกรรมเสี่ยง เช่น มีคู่นอนหลายคนหรือใช้เข็มฉีดยาร่วมกัน ช่วยลดโอกาสติดเชื้อได้ ควรศึกษาข้อมูลสุขภาพทางเพศจากแหล่งที่เชื่อถือได้ และหากพบอาการผิดปกติ เช่น แผลบริเวณอวัยวะเพศ หรือตกขาวผิดปกติ ควรปรึกษาแพทย์ทันที'
      };
    if (percentage > 4 && percentage <= 8)
      return { level: 'ปานกลาง', color: 'from-yellow-500 to-yellow-400', textColor: 'text-yellow-600', range: ((calculatedRisk / 8) * 25) + 25,
        advice: 'เข้ารับการตรวจสุขภาพทันทีและตรวจซ้ำทุก 3-6 เดือน การใช้ถุงยางอนามัยทุกครั้งที่มีเพศสัมพันธ์และหลีกเลี่ยงพฤติกรรมเสี่ยง เช่น การใช้เข็มร่วมกันหรือมีเพศสัมพันธ์โดยไม่ป้องกัน เป็นสิ่งสำคัญ ปรึกษาแพทย์เกี่ยวกับ PrEP เพื่อลดความเสี่ยง และหากพบอาการผิดปกติ เช่น แผลบริเวณอวัยวะเพศหรือตกขาวผิดปกติ ควรพบแพทย์ทันที'
      };
    if (percentage > 8 && percentage <= 11)
      return { level: 'สูง', color: 'from-orange-500 to-orange-400', textColor: 'text-orange-600', range: ((calculatedRisk / 8) * 25) + 50,
        advice: 'ควรเข้ารับการตรวจสุขภาพทันทีเพื่อประเมินสถานะและเริ่มรักษาเร็วที่สุดหากพบการติดเชื้อ การใช้ถุงยางอนามัยทุกครั้งที่มีเพศสัมพันธ์และหลีกเลี่ยงพฤติกรรมเสี่ยง เช่น การมีคู่นอนหลายคนหรือใช้เข็มร่วมกัน เป็นสิ่งจำเป็น ปรึกษาแพทย์เกี่ยวกับ PrEP หรือ PEP เพื่อลดความเสี่ยงเพิ่มเติม และหากพบอาการผิดปกติ เช่น แผลบริเวณอวัยวะเพศหรือตกขาวผิดปกติ ควรรีบพบแพทย์ การตรวจสุขภาพสม่ำเสมอและดูแลตนเองอย่างเคร่งครัดจะช่วยรักษาสุขภาพในระยะยาว'
      };
    if (percentage > 11 && percentage <= 138)
      return {
        level: 'สูงมาก', color: 'from-red-600 to-red-500', textColor: 'text-red-600', range: ((calculatedRisk / 8) * 25) + 75,
        advice: 'เข้ารับการตรวจสุขภาพทันที หากเสี่ยงติดเชื้อใน 72 ชั่วโมง เช่น มีเพศสัมพันธ์โดยไม่ป้องกันกับผู้ติดเชื้อ HIV ควรเริ่มยาต้านไวรัสฉุกเฉิน(PEP)ทันที สำหรับผู้ที่มีพฤติกรรมเสี่ยงต่อเนื่องควรปรึกษาแพทย์เกี่ยวกับ PrEP เพื่อป้องกันในระยะยาว การใช้ถุงยางอนามัยทุกครั้ง หลีกเลี่ยงการใช้เข็มร่วมกัน และลดพฤติกรรมเสี่ยงเป็นสิ่งสำคัญ หากพบอาการผิดปกติ เช่น แผลบริเวณอวัยวะเพศหรือตกขาวผิดปกติ ควรรีบพบแพทย์ทันที'
      };
    return {
      level: 'สูงมาก', color: 'from-red-600 to-red-500', textColor: 'text-red-600', range: ((calculatedRisk / 8) * 25) + 75,
      advice: 'เข้ารับการตรวจสุขภาพทันที หากเสี่ยงติดเชื้อใน 72 ชั่วโมง เช่น มีเพศสัมพันธ์โดยไม่ป้องกันกับผู้ติดเชื้อ HIV ควรเริ่มยาต้านไวรัสฉุกเฉิน(PEP)ทันที สำหรับผู้ที่มีพฤติกรรมเสี่ยงต่อเนื่องควรปรึกษาแพทย์เกี่ยวกับ PrEP เพื่อป้องกันในระยะยาว การใช้ถุงยางอนามัยทุกครั้ง หลีกเลี่ยงการใช้เข็มร่วมกัน และลดพฤติกรรมเสี่ยงเป็นสิ่งสำคัญ หากพบอาการผิดปกติ เช่น แผลบริเวณอวัยวะเพศหรือตกขาวผิดปกติ ควรรีบพบแพทย์ทันที'
    };
  };

  const { level, color, textColor, range, advice } = getRiskLevel(calculatedRisk);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 mb-8 rounded-xl">
      <div className="mb-4 text-center">
        <span className="text-2xl font-semibold text-gray-800">ระดับความเสี่ยง: </span>
        <span className={`text-3xl font-bold ${textColor}`}>{level}</span>
      </div>
      <div className="mb-6 text-start text-[15.5px] text-gray-600">
        {/* ค่าความเสี่ยง: <span className="font-semibold">{calculatedRisk.toLocaleString()}</span> */}
        <span className="font-semibold text-gray-800">คำแนะนำ: </span>{advice}
      </div>        
      <div className="relative h-10 rounded-full overflow-hidden border" style={{ boxShadow: '0px 0px 4px 2px rgb(0, 0, 0, 0.065' }}>
        <div
          className={`h-full ${color} transition-all duration-500 ease-out bg-gradient-to-r`}
          style={{ width: `${range}%` }}
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

