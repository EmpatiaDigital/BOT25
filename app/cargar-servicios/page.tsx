'use client';
import { useEffect, useState } from 'react';
import styles from '../Styles/cargarServicio.module.css';
import Swal from 'sweetalert2';

interface Servicio {
  _id?: string;
  nombre: string;
  descripcion?: string;
  precio?: string;
  imagenUrl?: string; // este campo ahora contendrá el base64
}

interface Avatar {
  _id: string;
  url: string;
}

export default function CargarServicio() {
  const [form, setForm] = useState<Servicio>({
    nombre: '',
    descripcion: '',
    precio: '',
    imagenUrl: '',
  });

  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    const res = await fetch('https://botbck25.onrender.com/api/servicio');
    const data = await res.json();
    setServicios(data);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setForm({ ...form, imagenUrl: base64 });
        setImagenPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitServicio = async (e: any) => {
    e.preventDefault();

    if (!form.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId
      ? `https://botbck25.onrender.com/api/servicio/${editId}`
      : 'https://botbck25.onrender.com/api/servicio';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await fetchServicios();
      setForm({ nombre: '', descripcion: '', precio: '', imagenUrl: '' });
      setImagenPreview(null);
      setEditId(null);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setForm(servicio);
    setImagenPreview(servicio.imagenUrl || null);
    setEditId(servicio._id || null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que querés eliminar este servicio?')) return;
    await fetch(`https://botbck25.onrender.com/api/servicio/${id}`, {
      method: 'DELETE',
    });
    fetchServicios();
  };

  return (
    <div className={styles.container}>
      <h1>Cargar Servicio</h1>

      <form onSubmit={handleSubmitServicio} className={styles.form}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del servicio *"
          value={form.nombre}
          onChange={handleInputChange}
          required
        />

        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleInputChange}
        />

        <input
          type="text"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleInputChange}
        />

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {imagenPreview && (
          <img
            src={imagenPreview}
            alt="Preview Imagen Servicio"
            className={styles.preview}
          />
        )}

        <button type="submit" style={{ marginTop: '20px' }}>
          {editId ? 'Actualizar' : 'Guardar'}
        </button>
      </form>

      <h2 className={styles.h2}>Servicios cargados</h2>
      <div className={styles.grid}>
        {servicios.map((s) => (
          <div key={s._id} className={styles.card}>
            {s.imagenUrl && <img src={s.imagenUrl} alt={s.nombre} />}
            <h3>{s.nombre}</h3>
            {s.descripcion && <p>{s.descripcion}</p>}
            {s.precio && <p className={styles.precio}>💰 {s.precio}</p>}
            <div className={styles.actions}>
              <button className={styles.button} onClick={() => handleEdit(s)}>
                Editar
              </button>
              <button
                className={styles.button}
                onClick={() => handleDelete(s._id!)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
