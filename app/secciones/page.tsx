'use client'

import Image from 'next/image'
import Link from 'next/link'
import styles from '../Styles/Secciones.module.css'

const menuItems = [
  {
    href: '/cargar-datos',
    label: 'Cargar Datos',
    image: '/assets/atencion.jpg',
  },
  {
    href: '/cargar-productos',
    label: 'Cargar Productos',
    image: '/assets/atencion.jpg',
  },
  {
    href: '/cargar-lista',
    label: 'Cargar Lista',
    image: '/assets/atencion.jpg',
  },
  {
    href: '/cargar-humano',
    label: 'Cargar Humano',
    image: '/assets/atencion.jpg',
  },
]

export default function Secciones() {
  return (
    <div className={styles.gridContainer}>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image src={item.image} alt={item.label} width={100} height={100} />
          </div>
          <h3>{item.label}</h3>
        </Link>
      ))}
    </div>
  )
}
