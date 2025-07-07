'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
// import Navbar from './components/Navbar.js';
import styles from './Styles/Home.module.css';

export default function Home() {
  const [qr, setQr] = useState(null);
  const [status, setStatus] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchQr = async () => {
    try {
      const res = await axios.get('https://botbck25.onrender.com/api/qr');
      if (res.data.qr) setQr(res.data.qr);
      else setQr(null);
    } catch (error) {
      console.error('Error al obtener el QR:', error);
    }
  };

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
      console.error('Error al verificar estado:', error);
    }
  };

  const fetchUserCount = async () => {
    try {
      const res = await axios.get('https://botbck25.onrender.com/api/users');
      setUserCount(res.data.count || 0);
    } catch (error) {
      console.error('Error al obtener el número de usuarios:', error);
    }
  };

  const handleSessionToggle = async () => {
    setLoading(true);
    try {
      if (status === 'activo') {
        await axios.get('https://botbck25.onrender.com/api/logout');
        Swal.fire('Sesión cerrada', 'El bot se desconectó.', 'info');
      } else {
        await axios.get('http://localhost:5000/api/qr');
        Swal.fire('Intentando iniciar sesión...', 'Escaneá el QR si aparece.', 'info');
      }
      await checkStatus();
      await fetchQr();
    } catch (error) {
      console.error('Error al manejar sesión:', error);
      Swal.fire('Error', 'Ocurrió un error al cambiar la sesión.', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQr();
    checkStatus();
    fetchUserCount();

    const interval = setInterval(() => {
      fetchQr();
      checkStatus();
      fetchUserCount();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className={styles.container}>
        <h1>Escaneá el código QR</h1>

        <div className={styles.qrContainer}>
          {qr ? <img src={qr} alt="Código QR" className={styles.qrImage} /> : <span>QR</span>}
        </div>

        <div className={styles.statusBox}>
          <span
            className={styles.statusCircle}
            style={{ backgroundColor: status === 'activo' ? 'green' : 'red' }}
          ></span>
          {status === 'activo' ? (
            <>
              🤖 Estoy atendiendo a <strong>{userCount}</strong> persona{userCount !== 1 && 's'}
            </>
          ) : (
            <>🤖 Bot fuera de servicio</>
          )}
        </div>
        <br></br>
        <button
          onClick={handleSessionToggle}
          disabled={loading}
          className={`${styles.btn} ${status === 'activo' ? styles.btnActive : styles.btnInactive}`}
        >
          {status === 'activo' ? 'Cerrar sesión' : 'Iniciar sesión'}
        </button>
      </div>
    </>
  );
}
