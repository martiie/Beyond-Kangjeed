'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Pacifico } from 'next/font/google'
import { Menu, X } from 'lucide-react'
import styles from '../styles/Navbar.module.css'

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

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <nav className={`${styles.nav}`}>
        <h1 className={`${styles.navTitle} ${pacifico.className}`}>Love Foundation</h1>
        <div className={styles.desktopMenu}>
          <Link href="#" className={styles.navLink}>เกี่ยวกับเรา</Link>
          <Link href="#" className={styles.navLink}>ข่าวสาร</Link>
          <Link href="#" className={styles.navLink}>ติดต่อเรา</Link>
        </div>
        <button 
          className={styles.hamburger} 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuContent}>
          <Link href="#" className={styles.navLink} onClick={toggleMenu}>เกี่ยวกับเรา</Link>
          <Link href="#" className={styles.navLink} onClick={toggleMenu}>ข่าวสาร</Link>
          <Link href="#" className={styles.navLink} onClick={toggleMenu}>ติดต่อเรา</Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;

