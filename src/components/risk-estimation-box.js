'use client'

import { useState, useEffect, useCallback } from 'react'
import '../styles/calRisk.css'

const activityPairs = {
  'receptive_anal_sex': 'insertive_anal_sex',
  'insertive_anal_sex': 'receptive_anal_sex',
  'receptive_vaginal_sex': 'insertive_vaginal_sex',
  'insertive_vaginal_sex': 'receptive_vaginal_sex'
}

const checkboxOptions = [
  { name: 'PrEP', label: 'PrEP', category: 'ปัจจัยการป้องการ' },
  { name: 'prot', label: 'สวมถุงยาง', category: 'ปัจจัยการป้องการ' },
  { name: 'ART_UVL', label: 'ART + UVL', category: 'ปัจจัยการป้องการ' },
  { name: 'acute_hiv_infection_hiv_positive_partner', label: 'การติดเชื้อ HIV เฉียบพลันในคู่ที่มีเชื้อ HIV', category: 'ปัจจัยเสี่ยง' },
  { name: 'std_infection_hiv_negative_partner', label: 'การติดเชื้อโรคติดต่อทางเพศสัมพันธ์ (ไม่มีเชื้อ HIV)', category: 'ปัจจัยเสี่ยง' },
  { name: 'std_infection_hiv_positive_partner', label: 'การติดเชื้อโรคติดต่อทางเพศสัมพันธ์ (มีเชื้อ HIV)', category: 'ปัจจัยเสี่ยง' }
]

export function RiskEstimationBox({ onCalRiskDataChange }) {
  const [formData, setFormData] = useState({
    partner1: false,
    act1: 'insertive_vaginal_sex',
    act2: 'receptive_vaginal_sex',
    PrEP: false,
    prot: false,
    ART_UVL: false,
    acute_hiv_infection_hiv_positive_partner: false,
    std_infection_hiv_negative_partner: false,
    std_infection_hiv_positive_partner: false,
  })

  const updateCalRiskData = useCallback(() => {
    const newCalRiskData = [
      {
        partner: formData.partner1,
        act: formData.act1,
        PrEP: formData.PrEP,
        prot: formData.prot,
        ART_UVL: formData.ART_UVL,
        acute_hiv_infection_hiv_positive_partner: formData.acute_hiv_infection_hiv_positive_partner,
        std_infection_hiv_negative_partner: formData.std_infection_hiv_negative_partner,
        std_infection_hiv_positive_partner: formData.std_infection_hiv_positive_partner
      }
    ]
    onCalRiskDataChange(newCalRiskData)
  }, [formData, onCalRiskDataChange])

  useEffect(() => {
    updateCalRiskData()
  }, [updateCalRiskData])

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      PrEP: false,
      prot: false,
      ART_UVL: false,
      acute_hiv_infection_hiv_positive_partner: false,
      std_infection_hiv_negative_partner: false,
      std_infection_hiv_positive_partner: false,
    }))
  }, [formData.partner1, formData.act1, formData.act2])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'act1' || name === 'act2') {
      const otherAct = name === 'act1' ? 'act2' : 'act1'
      const newValue = value === 'receptive_anal_sex' ? 'insertive_anal_sex' :
        value === 'insertive_anal_sex' ? 'receptive_anal_sex' :
          activityPairs[value]
      setFormData(prev => ({
        ...prev,
        [name]: value,
        [otherAct]: newValue
      }))
    } else if (name === 'partner1') {
      setFormData(prev => ({
        ...prev,
        [name]: JSON.parse(value),
        // รีเซ็ต STD checkboxes เมื่อเปลี่ยนสถานะ HIV
        std_infection_hiv_negative_partner: false,
        std_infection_hiv_positive_partner: false
      }))
    } else if (type === 'checkbox') {
      const checkboxName = name.replace(/^partner[12]_/, '');
      const enabledCheckboxes = getEnabledCheckboxes(name.startsWith('partner1_'));
      if (enabledCheckboxes.includes(checkboxName)) {
        setFormData(prev => {
          const newState = {
            ...prev,
            [checkboxName]: checked
          };

          // Reset conflicting checkbox
          if (checkboxName === 'ART_UVL' && checked) {
            newState.acute_hiv_infection_hiv_positive_partner = false;
          } else if (checkboxName === 'acute_hiv_infection_hiv_positive_partner' && checked) {
            newState.ART_UVL = false;
          }

          return newState;
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const getEnabledCheckboxes = (isPartner1) => {
    const isHIVPositive = isPartner1 ? formData.partner1 : !formData.partner1
    const activity = isPartner1 ? formData.act1 : formData.act2

    let enabledCheckboxes = []

    if (isHIVPositive) {
      if (activity === 'receptive_vaginal_sex') {
        enabledCheckboxes = ['ART_UVL', 'std_infection_hiv_positive_partner', 'acute_hiv_infection_hiv_positive_partner']
      } else if (activity === 'insertive_vaginal_sex' || activity === 'insertive_anal_sex') {
        enabledCheckboxes = ['prot', 'ART_UVL', 'std_infection_hiv_positive_partner', 'acute_hiv_infection_hiv_positive_partner']
      } else if (activity === 'receptive_anal_sex') {
        enabledCheckboxes = ['ART_UVL', 'std_infection_hiv_positive_partner', 'acute_hiv_infection_hiv_positive_partner']
      }

      // Disable Acute if ART_UVL is selected, and vice versa
      if (formData.ART_UVL) {
        enabledCheckboxes = enabledCheckboxes.filter(checkbox => checkbox !== 'acute_hiv_infection_hiv_positive_partner')
      } else if (formData.acute_hiv_infection_hiv_positive_partner) {
        enabledCheckboxes = enabledCheckboxes.filter(checkbox => checkbox !== 'ART_UVL')
      }
    } else {
      if (activity === 'insertive_vaginal_sex' || activity === 'insertive_anal_sex') {
        enabledCheckboxes = ['PrEP', 'prot', 'std_infection_hiv_negative_partner']
      } else if (activity === 'receptive_anal_sex' || activity === 'receptive_vaginal_sex') {
        enabledCheckboxes = ['PrEP', 'std_infection_hiv_negative_partner']
      }
    }

    return enabledCheckboxes
  }

  const renderPartnerForm = (isPartner1) => {
    const partnerNumber = isPartner1 ? '1' : '2'
    const activityName = isPartner1 ? 'act1' : 'act2'
    const enabledCheckboxes = getEnabledCheckboxes(isPartner1)

    return (
      <div className="bg-white p-4 sm:p-6 md:p-10 rounded-lg shadow-lg w-full">
        {isPartner1 ? (
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800">คุณ</h2>
        ) :
          (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800">คู่นอนของคุณ</h2>
          )
        }
        <hr className="divider" />
        <form className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center space-x-2 sm:space-x-4">
            <label className="text-gray-700 font-bold mb-2 sm:mb-0 text-lg">สถานะ HIV</label>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`partner${partnerNumber}-negative`}
                name={`partner${partnerNumber}`}
                value="false"
                checked={isPartner1 ? !formData.partner1 : formData.partner1}
                onChange={isPartner1 ? handleChange : undefined}
                disabled={!isPartner1}
                className="h-4 w-4 sm:h-5 sm:w-5"
              />
              <label htmlFor={`partner${partnerNumber}-negative`} className="text-sm sm:text-base">ไม่มีเชื้อ</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id={`partner${partnerNumber}-positive`}
                name={`partner${partnerNumber}`}
                value="true"
                checked={isPartner1 ? formData.partner1 : !formData.partner1}
                onChange={isPartner1 ? handleChange : undefined}
                disabled={!isPartner1}
                className="h-4 w-4 sm:h-5 sm:w-5"
              />
              <label htmlFor={`partner${partnerNumber}-positive`} className="text-sm sm:text-base">มีเชื้อ</label>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-4">
            <label htmlFor={`activity-${partnerNumber}`} className="text-gray-700 font-bold block text-lg">กิจกรรม</label>
            <select
              id={`activity-${partnerNumber}`}
              name={activityName}
              value={formData[activityName]}
              onChange={handleChange}
              disabled={!isPartner1}
              className={`w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${isPartner1 ? 'ArrowShowOnly' : 'appearance-none'}`}
            >
              <option value="insertive_vaginal_sex">การสอดใส่ทางช่องคลอด</option>
              <option value="receptive_vaginal_sex">การรับการสอดใส่ทางช่องคลอด</option>
              <option value="receptive_anal_sex">การรับการสอดใส่ทางทวารหนัก</option>
              <option value="insertive_anal_sex">การสอดใส่ทางทวารหนัก</option>
            </select>
          </div>

          <div className="space-y-2 sm:space-y-4">
            {['ปัจจัยการป้องการ', 'ปัจจัยเสี่ยง'].map(category => (
              <div key={category}>
                <h3 className="text-gray-700 font-bold mb-2 mt-6 text-lg">{category}</h3>
                {checkboxOptions
                  .filter(option => option.category === category)
                  .map(option => {
                    const isEnabled = enabledCheckboxes.includes(option.name);
                    const checkboxName = `partner${partnerNumber}_${option.name}`;
                    // แสดงทุก checkbox ยกเว้น STD ที่ถูก disable
                    if (isEnabled || (!option.name.includes('std_infection'))) {
                      return (
                        <div key={option.name} className="flex items-center space-x-2 sm:space-x-4 mb-2">
                          <input
                            type="checkbox"
                            id={checkboxName}
                            name={checkboxName}
                            checked={isEnabled ? formData[option.name] : false}
                            onChange={handleChange}
                            disabled={!isEnabled}
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${!isEnabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                          />
                          <label
                            htmlFor={checkboxName}
                            className={`text-sm sm:text-base text-gray-700 ${!isEnabled ? 'opacity-60' : ''}`}
                          >
                            {option.label}
                          </label>
                        </div>
                      );
                    }
                    return null;
                  })}
              </div>
            ))}
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {renderPartnerForm(true)}
      {renderPartnerForm(false)}
    </div>
  )
}

