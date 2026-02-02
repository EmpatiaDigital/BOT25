'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import styles from './Styles/Home.module.css';

export default function Home() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  /* ───────────── QR ───────────── */

  const fetchQr = async () => {
    try {
      const res = await axios.get(
        'https://botbck25.onrender.com/api/qr',
        { headers: { 'Cache-Control': 'no-cache' } }
      );

      if (res.data?.qr) {
        setQr(res.data.qr); // ✅ SOLO seteamos si hay QR
      }
    } catch (error) {
      console.error('❌ Error al obtener el QR:', error);
    }
  };

  /* ───────────── STATUS ───────────── */

  const checkStatus = async () => {
    try {
      const res = await axios.get('https://botbck25.onrender.com/api/status');
      setStatus(res.data.status);

      const alreadyShown = localStorage.getItem('alertShown') === 'true';

      if (res.data.status === 'activo' && !alreadyShown) {
        Swal.fire({
          title: 'Conexión exitosa',
          text: 'El bot está conectado a WhatsApp',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false,
        });
        localStorage.setItem('alertShown', 'true');
      }

      if (res.data.status !== 'activo') {
        localStorage.setItem('alertShown', 'false');
      }
    } catch (error) {
      console.error('❌ Error al verificar estado:', error);
    }
  };

  /* ───────────── USERS ───────────── */

  const fetchUserCount = async () => {
    try {
      const res = await axios.get('https://botbck25.onrender.com/api/users');
      setUserCount(res.data.count || 0);
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
    }
  };

  /* ───────────── BOTÓN ───────────── */

  const handleSessionToggle = async () => {
    setLoading(true);
    try {
      if (status === 'activo') {
        await axios.get('https://botbck25.onrender.com/api/logout');
        Swal.fire('Sesión cerrada', 'El bot se desconectó.', 'info');
        setQr(null);
      } else {
        await axios.get('https://botbck25.onrender.com/api/qr');
        Swal.fire(
          'Iniciando sesión',
          'Escaneá el QR cuando aparezca',
          'info'
        );
        fetchQr();
      }
    } catch (error) {
      console.error('❌ Error al manejar sesión:', error);
      Swal.fire('Error', 'No se pudo cambiar la sesión.', 'error');
    }
    setLoading(false);
  };

  /* ───────────── EFFECT ───────────── */

  useEffect(() => {
    fetchQr();
    checkStatus();
    fetchUserCount();

    const interval = setInterval(() => {
      if (!qr) {
        fetchQr(); // ✅ solo si NO hay QR
      }
      checkStatus();
      fetchUserCount();
    }, 5000);

    return () => clearInterval(interval);
  }, [qr]);

  /* ───────────── RENDER ───────────── */

  return (
    <div className={styles.container}>
      <h1>Escaneá el código QR</h1>

      <div className={styles.qrContainer}>
        {qr ? (
          <img
            src={qr}
            alt="Código QR WhatsApp"
            className={styles.qrImage}
            style={{
              width: 280,
              height: 280,
              background: 'white',
            }}
          />
        ) : (
          <span>Esperando QR...</span>
        )}
      </div>

      <div className={styles.statusBox}>
        <span
          className={styles.statusCircle}
          style={{ backgroundColor: status === 'activo' ? 'green' : 'red' }}
        />
        {status === 'activo' ? (
          <>
            🤖 Estoy atendiendo a <strong>{userCount}</strong> persona
            {userCount !== 1 && 's'}
          </>
        ) : (
          <>🤖 Bot fuera de servicio</>
        )}
      </div>

      <br />

      <button
        onClick={handleSessionToggle}
        disabled={loading}
        className={`${styles.btn} ${
          status === 'activo' ? styles.btnActive : styles.btnInactive
        }`}
      >
        {status === 'activo' ? 'Cerrar sesión' : 'Iniciar sesión'}
      </button>
    </div>
  );
}
