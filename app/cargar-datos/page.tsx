'use client'

import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import styles from '../Styles/CargarDatos.module.css'

type DireccionType = {
  calle?: string
  horario?: string
  web?: string
}

export default function CargarDatos() {
  const [direccion, setDireccion] = useState<DireccionType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<DireccionType>({
    calle: '',
    horario: '',
    web: '',
  })

  useEffect(() => {
    fetch('https://botbck25.onrender.com/api/direccion')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setDireccion(data)
          setFormData({
            calle: data.calle || '',
            horario: data.horario || '',
            web: data.web || '',
          })
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        Swal.fire('Error', 'Failed to load data', 'error')
      })
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  async function handleSave() {
    try {
      const res = await fetch('https://botbck25.onrender.com/api/direccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (data.success) {
        setDireccion(data.direccion)
        setEditMode(false)
        Swal.fire('Success', 'Data saved successfully', 'success')
      } else {
        throw new Error()
      }
    } catch {
      Swal.fire('Error', 'Failed to save data', 'error')
    }
  }

  async function handleSendWhatsapp() {
    if (!direccion || Object.keys(direccion).length === 0) {
      Swal.fire('Sin datos', 'No hay información para enviar.', 'info')
      return
    }
  
    // Construir mensaje con los datos disponibles
    let mensaje = '📍 *Estos son los datos del negocio, gracias por preguntar:*\n'
  
    if (direccion.calle) {
      mensaje += `📌 Dirección: ${direccion.calle}\n`
    }
    if (direccion.horario) {
      mensaje += `⏰ Horario: ${direccion.horario}\n`
    }
    if (direccion.web) {
      mensaje += `🌐 Web: ${direccion.web}`
    }
  
    // Codificar mensaje para URL
    const encodedMsg = encodeURIComponent(mensaje)
  
    // Redirigir a WhatsApp Web con el mensaje precargado
    const whatsappURL = `https://wa.me/?text=${encodedMsg}`
  
    // Abrir en una nueva pestaña
    window.open(whatsappURL, '_blank')
  }
  

  if (loading) return <p className={styles.loading}>Loading...</p>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dirección</h1>

      {!direccion && !editMode && (
        <div>
          <p className={styles.message}>Todavía no hay datos guardados.</p>
          <button className={styles.addButton} onClick={() => setEditMode(true)}>
            Agregar Dirección
          </button>
        </div>
      )}

      {(direccion || editMode) && (
        <div>
          <label className={styles.label}>
            Estamos en:
            {editMode ? (
              <input
                type="text"
                name="calle"
                value={formData.calle || ''}
                onChange={handleChange}
                className={styles.input}
              />
            ) : (
              <p className={styles.text}><em>{direccion?.calle || '-'}</em></p>
            )}
          </label>

          <label className={styles.label}>
            en el horario de:
            {editMode ? (
              <input
                type="text"
                name="horario"
                value={formData.horario || ''}
                onChange={handleChange}
                className={styles.input}
              />
            ) : (
              <p className={styles.text}><em>{direccion?.horario || '-'}</em></p>
            )}
          </label>

          <label className={styles.label}>
            Nuestra Web es:
            {editMode ? (
              <input
                type="text"
                name="web"
                value={formData.web || ''}
                onChange={handleChange}
                className={styles.input}
              />
            ) : (
              <p className={styles.text}><em>{direccion?.web || '-'}</em></p>
            )}
          </label>

          <div className={styles.buttonGroup}>
            {editMode ? (
              <>
                <button onClick={handleSave} className={styles.saveButton}>
                  Guardar
                </button>
                <button onClick={() => setEditMode(false)} className={styles.cancelButton}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditMode(true)} className={styles.editButton}>
                  Editar
                </button>
                <button onClick={handleSendWhatsapp} className={styles.whatsappButton}>
                  Enviar por WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
