'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../compoCSS/Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>
            Login
          </Link>
        </li>
        <li>
          <Link href="/secciones" className={pathname === '/Secciones' ? styles.active : ''}>
            Secciones
          </Link>
        </li>
        <li>
          <Link href="/Registrate" className={pathname === '/Registrate' ? styles.active : ''}>
            Registrate
          </Link>
        </li>
      </ul>
    </nav>
  );
}
