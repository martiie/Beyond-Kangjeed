'use client'

import { useState } from "react";
import Link from "next/link";
import styles from '../styles/HomePage.module.css';
import Navbar from '../components/navbar-homepage';
import ChatBot from '../components/chatBot'; // นำเข้า ChatBot Component
import { fetchGPTResponse } from "../app/chat-bot/api"
import { dataset } from "../app/chat-bot/dataset"

const HomePage = () => {
  const [isOpenChat, setIsOpenChat] = useState(false); // State สำหรับควบคุมการแสดงผลของ ChatBot

  return (
    <div className={styles.container} style={{
      backgroundImage: "url('/img/pride_gradient_1.jpeg')"
    }}>
      <div className={styles.overlay}></div>

      <Navbar />

      <div className={styles.mainContent}>
        <h1 className={styles.title}>
          การป้องกันและ<br />การดูแลรักษาโรค HIV
        </h1>
        <div className={styles.descriptionContainer}>
          <p className={styles.description}>
            HIV หรือไวรัสภูมิคุ้มกันบกพร่องเป็นไวรัสที่โจมตีระบบภูมิคุ้มกัน
            ทำให้ร่างกายอ่อนแอและเสี่ยงต่อการติดเชื้อและโรคต่างๆ
            การติดเชื้อ HIV สามารถป้องกันได้ด้วยการใช้ถุงยางอนามัยทุกครั้ง
            ที่มีเพศสัมพันธ์ และตรวจสุขภาพเป็นประจำ การรักษา HIV มีการ
            พัฒนาอย่างต่อเนื่อง ช่วยให้ผู้ติดเชื้อมีชีวิตที่ยืนยาวและคุณภาพชีวิตที่ดีขึ้น
          </p>
        </div>
        <div className={styles.buttons}>
          <Link href="/estimate">
            <button className={styles.estimateButton}>
              ประเมินความเสี่ยง
            </button>
          </Link>
          <button 
            className={styles.chatbotButton} 
            onClick={() => setIsOpenChat(!isOpenChat)} // ใช้ isOpenChat แทน
          >
            <span className={styles.chatbotButtonBorder}>
              <span className={styles.chatbotButtonContent}>
                ปรึกษา ChatBot
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* แสดง ChatBot Component เมื่อ isOpenChat เป็น true */}
      {isOpenChat && (
        <div className={styles.chatbotContainer}>
          <ChatBot isOpenChat={isOpenChat} setIsOpenChat={setIsOpenChat} dataset={dataset} fetchGPTResponse={fetchGPTResponse} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
