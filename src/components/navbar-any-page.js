'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Pacifico } from 'next/font/google'
import { Menu } from 'lucide-react'
import styles from '../styles/NavbarAnyPage.module.css'

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const Navbar = () => {
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
    <>
      <nav className={`${styles.nav} shadow-lg`}>
        <h1 className={`${styles.navTitle} ${pacifico.className}`}>Love Foundation</h1>
        <div className={styles.desktopMenu}>
          <Link href="#" className={styles.navLink}>เกี่ยวกับเรา</Link>
          <Link href="#" className={styles.navLink}>ข่าวสาร</Link>
          <Link href="#" className={styles.navLink}>ติดต่อเรา</Link>
        </div>
        <button className={styles.hamburger} onClick={toggleMenu}>
          <Menu size={24} />
        </button>
      </nav>

      {isMenuOpen && (
        <div className={styles.mobileMenu} onClick={handleBackgroundClick}>
          <div className={styles.mobileMenuContent}>
            <Link href="#" className={styles.navLink}>เกี่ยวกับเรา</Link>
            <Link href="#" className={styles.navLink}>ข่าวสาร</Link>
            <Link href="#" className={styles.navLink}>ติดต่อเรา</Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

