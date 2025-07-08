'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import styles from '../Styles/CargarLista.module.css';

interface PreviewData {
  id: string;
  base64: string;
  mimetype: string;
  nombre: string;
}

interface Lista {
  _id: string;
  titulo?: string;
  fechaSubida: string;
}

export default function CargarLista() {
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState('');
  const [listas, setListas] = useState<Lista[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const fetchListas = async () => {
    try {
      const res = await fetch('https://botbck25.onrender.com/api/lista');
      const data = await res.json();
      setListas(data);
    } catch {
      Swal.fire('Error', 'No se pudo cargar la lista desde el servidor', 'error');
    }
  };

  useEffect(() => {
    fetchListas();
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire('Atención', 'Selecciona un archivo', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('titulo', titulo);

    try {
      console.log('Enviando archivo:', file);
      const res = await fetch('https://botbck25.onrender.com/api/lista/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        Swal.fire('Error', errorData.error || 'Error al subir archivo', 'error');
        return;
      }

      const result = await res.json();
      console.log('Respuesta subida:', result);

      setFile(null);
      setTitulo('');
      fetchListas();
      Swal.fire('¡Listo!', 'Archivo subido correctamente', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`https://botbck25.onrender.com/api/lista/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar');

      fetchListas();
      Swal.fire('Eliminado', 'Archivo eliminado correctamente', 'success');

      if (previewData?.id === id) {
        setPreviewData(null);
      }
    } catch {
      Swal.fire('Error', 'No se pudo eliminar el archivo', 'error');
    }
  };

  const handleVerArchivo = async (id: string) => {
    try {
      const res = await fetch(`https://botbck25.onrender.com/api/lista/archivo/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener el archivo');
      const data = await res.json();

      console.log('Archivo recuperado:', data);

      setPreviewData({
        id,
        base64: data.base64,
        mimetype: data.mimetype,
        nombre: data.nombre,
      });
    } catch (error: any) {
      Swal.fire('Error', 'Error al cargar archivo: ' + error.message, 'error');
    }
  };

  const formatFecha = (fechaStr: string): string => {
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    const fechaFormateada = `${fecha.toLocaleDateString('es-AR', {
      weekday: 'long',
    })} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;

    return diff > 30
      ? `${fechaFormateada} (más de un mes atrás)`
      : `${fechaFormateada} (hace ${diff} día${diff !== 1 ? 's' : ''})`;
  };

  return (
    <div className={styles.container}>
      <h2>Subir lista</h2>

      <div className={styles.dropArea} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        {file ? <p>{file.name}</p> : <p>Arrastrá tu PDF o Word aquí</p>}
      </div>

      <input
        type="text"
        placeholder="Título (opcional)"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className={styles.input}
      />

      <button onClick={handleUpload} className={styles.btn}>
        Subir
      </button>

      <div className={styles.lista}>
        {listas.map((item) => {
          const fechaSubida = new Date(item.fechaSubida);
          const haceMasDeUnMes = Date.now() - fechaSubida.getTime() > 30 * 24 * 60 * 60 * 1000;

          return (
            <div key={item._id} className={styles.item}>
              <p>
                <strong>Lista</strong> {item.titulo || 'Sin título'} de {formatFecha(item.fechaSubida)}
              </p>
              {haceMasDeUnMes && <span className={styles.alert}>⚠ Esta lista tiene más de un mes</span>}
              <button onClick={() => handleVerArchivo(item._id)} className={styles.linkBtn}>
                Ver archivo
              </button>
              <button onClick={() => handleDelete(item._id)} className={styles.deleteBtn}>
                Eliminar
              </button>
            </div>
          );
        })}
      </div>

      {previewData && (
        <div className={styles.previewContainer}>
          <h3 className={styles.previewTitle}>Vista previa: {previewData.nombre}</h3>

          {previewData.base64 && previewData.mimetype.startsWith('application/pdf') ? (
            <iframe
              src={`data:${previewData.mimetype};base64,${previewData.base64}`}
              width="100%"
              height="600px"
              title="Vista previa PDF"
              className={styles.iframe}
            />
          ) : previewData.mimetype.includes('word') ? (
            // Visor Word usando Microsoft Office Online embebido
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                `https://botbck25.onrender.com/api/lista/archivo/${previewData.id}/download`
              )}`}
              width="100%"
              height="600px"
              frameBorder="0"
              title="Vista previa Word"
              className={styles.iframe}
            />
          ) : (
            <>
              <img
                src={
                  previewData.mimetype.includes('word')
                    ? 'https://cdn-icons-png.flaticon.com/512/337/337932.png'
                    : 'https://cdn-icons-png.flaticon.com/512/337/337946.png'
                }
                alt="Archivo"
                className={styles.fileIcon}
              />

              <p>Este tipo de archivo no se puede previsualizar aquí.</p>
              <a
                href={`data:${previewData.mimetype};base64,${previewData.base64}`}
                download={previewData.nombre}
                className={styles.downloadLink}
              >
                Descargar {previewData.nombre}
              </a>
            </>
          )}

          <button onClick={() => setPreviewData(null)} className={styles.closeBtn}>
            Cerrar vista previa
          </button>
        </div>
      )}
    </div>
  );
}
