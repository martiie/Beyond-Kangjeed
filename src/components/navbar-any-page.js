'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Pacifico } from 'next/font/google'
import { Menu, X } from 'lucide-react'
import styles from '../styles/NavbarAnyPage.module.css'
import ChatBot from '../components/chatBot'

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenChat, setIsOpenChat] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  return (
    <>
      <nav className={`${styles.nav} shadow-lg`}>
        <Link href="/" className={`${styles.navTitle} ${pacifico.className}`}>Love Foundation</Link>
        <div className={styles.desktopMenu}>
          <Link href="#" className={styles.navLink}>เกี่ยวกับเรา</Link>
          <Link href="#" className={styles.navLink}>ข่าวสาร</Link>
          <Link href="#" className={styles.navLink}>ติดต่อเรา</Link>
          <button
            className={styles.chatbotButton}
            onClick={() => setIsOpenChat(!isOpenChat)}
          >
            บริการ ChatBot
          </button>
        </div>
        <button className={styles.hamburger} onClick={toggleMenu} aria-expanded={isMenuOpen} aria-label="Toggle menu">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuContent}>
          <Link href="#" className={styles.mobileNavLink} onClick={toggleMenu}>เกี่ยวกับเรา</Link>
          <Link href="#" className={styles.mobileNavLink} onClick={toggleMenu}>ข่าวสาร</Link>
          <Link href="#" className={styles.mobileNavLink} onClick={toggleMenu}>ติดต่อเรา</Link>
          <button
            className={styles.mobileChatbotButton}
            onClick={() => {
              setIsOpenChat(!isOpenChat);
              toggleMenu();
            }}
          >
            บริการ ChatBot
          </button>
        </div>
      </div>

      {isOpenChat && (
        <div className={styles.chatbotContainer}>
          <ChatBot isOpenChat={isOpenChat} setIsOpenChat={setIsOpenChat}/>
        </div>
      )}
    </>
  );
};

export default Navbar;

