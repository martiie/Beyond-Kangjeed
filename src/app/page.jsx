'use client'

import Link from "next/link";
import { Pacifico } from 'next/font/google'
import styles from '../styles/HomePage.module.css'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <div className={styles.container} style={{
      backgroundImage: "url('/img/pride_gradient_1.jpeg')"
    }}>
      <div className={styles.overlay}></div>

      <nav className={styles.nav}>
        <h1 className={`${styles.navTitle} ${pacifico.className}`}>Love Foundation</h1>
        <div className={styles.desktopMenu}>
          <a href="#" className={styles.navLink}>เกี่ยวกับเรา</a>
          <a href="#" className={styles.navLink}>ข่าวสาร</a>
          <a href="#" className={styles.navLink}>ติดต่อเรา</a>
        </div>
        <button className={styles.hamburger} onClick={toggleMenu}>
          <Menu size={24} />
        </button>
      </nav>

      {isMenuOpen && (
        <div className={styles.mobileMenu} onClick={handleBackgroundClick}>
          <div className={styles.mobileMenuContent}>
            <a href="#" className={styles.navLink}>เกี่ยวกับเรา</a>
            <a href="#" className={styles.navLink}>ข่าวสาร</a>
            <a href="#" className={styles.navLink}>ติดต่อเรา</a>
          </div>
        </div>
      )}

      <div className={styles.mainContent}>
        <h1 className={styles.title}>
          การป้องกันและการ<br />ดูแลรักษาโรค HIV
        </h1>
        <div className={styles.descriptionContainer}>
          <p className={styles.description}>
            HIV หรือไวรัสภูมิคุ้มกันบกพร่องเป็นไวรัสที่โจมตีระบบภูมิคุ้มกัน
            ทำให้ร่างกายอ่อนแอและเสี่ยงต่อการติดเชื้อและโรคต่างๆการ
            ติดเชื้อ HIV สามารถป้องกันได้ด้วยการใช้ถุงยางอนามัยทุกครั้ง
            ที่มีเพศสัมพันธ์ และตรวจสุขภาพเป็นประจำการรักษา HIV มีการ
            พัฒนาอย่างต่อเนื่อง ช่วยให้ผู้ติดเชื้อมีชีวิตที่ยืนยาวและคุณภาพชีวิตที่ดีขึ้น
          </p>
        </div>
        <div className={styles.buttons}>
          <Link href="/estimate">
            <button className={styles.estimateButton}>
              ประเมินความเสี่ยง
            </button>
          </Link>
          <Link href="/chat-bot">
            <button className={styles.chatbotButton}>
              <span className={styles.chatbotButtonBorder}>
                <span className={styles.chatbotButtonContent}>
                  ปรึกษา ChatBot
                </span>
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

