'use client';
import { useState } from 'react';
import { calRisk } from './calRisk';
import '../../styles/cal_risk.css'

const EstimatePage = () => {
  const [formData, setFormData] = useState({
    partner1: false,
    act: 'insertive_vaginal_sex', // default activity
    PrEP: false,
    prot: false,
    ART_UVL: false,
    acute_hiv_infection_hiv_positive_partner: false,
    std_infection_hiv_negative_partner: false,
    std_infection_hiv_positive_partner: false,
  });

  const [risk, setRisk] = useState(0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : name === 'partner1' ? JSON.parse(value) : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = calRisk(
      formData.partner1,
      formData.act,
      formData.PrEP,
      formData.prot,
      formData.ART_UVL,
      formData.acute_hiv_infection_hiv_positive_partner,
      formData.std_infection_hiv_negative_partner,
      formData.std_infection_hiv_positive_partner
    );
    setRisk(result);
  };

  return (
    <div className='box'>
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto contrainer-cal">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Risk Estimation</h1>
      <hr className="divider" />
      {risk !== null && <p className="mt-6 text-center font-bold text-gray-800">Calculated Risk: {risk}</p>}
      <div className="risk-bar-container">
      <span className="label-left">ความเสี่ยงต่ำ</span>
      <div className="risk-bar"></div>
      <span className="label-right">ความเสี่ยงสูง</span>
      </div>
      <hr className="divider" />
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex items-center space-x-4">
          <label className="text-gray-700">Partner</label>
          <input
            type="radio"
            name="partner1"
            value="true"
            checked={formData.partner1 === true}
            onChange={handleChange}
            className="h-5 w-5"
          />
          <span className='text-m'>บวก</span>
          <input
            type="radio"
            name="partner1"
            value="false"
            checked={formData.partner1 === false}
            onChange={handleChange}
            className="h-5 w-5"
          />
          <span className='text-m'>ลบ</span>
          
        </div>

        <div className="space-y-4">
          <label className="text-gray-700">Activity:</label>
          <select
            name="act"
            value={formData.act}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="receptive_anal_sex">Receptive Anal Sex</option>
            <option value="insertive_anal_sex">Insertive Anal Sex</option>
            <option value="receptive_vaginal_sex">Receptive Vaginal Sex</option>
            <option value="insertive_vaginal_sex">Insertive Vaginal Sex</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700">PrEP (True/False):</label>
          <input
            type="checkbox"
            name="PrEP"
            checked={formData.PrEP}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700">Protection (True/False):</label>
          <input
            type="checkbox"
            name="prot"
            checked={formData.prot}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700">ART UVL (True/False):</label>
          <input
            type="checkbox"
            name="ART_UVL"
            checked={formData.ART_UVL}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700">Acute HIV Infection with HIV Positive Partner (True/False):</label>
          <input
            type="checkbox"
            name="acute_hiv_infection_hiv_positive_partner"
            checked={formData.acute_hiv_infection_hiv_positive_partner}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700">STD Infection (HIV Negative Partner) (True/False):</label>
          <input
            type="checkbox"
            name="std_infection_hiv_negative_partner"
            checked={formData.std_infection_hiv_negative_partner}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-gray-700">STD Infection (HIV Positive Partner) (True/False):</label>
          <input
            type="checkbox"
            name="std_infection_hiv_positive_partner"
            checked={formData.std_infection_hiv_positive_partner}
            onChange={handleChange}
            className="h-5 w-5"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-200"
        >
          Calculate Risk
        </button>
      </form>
    </div>
    </div>
  );
};

export default EstimatePage;
