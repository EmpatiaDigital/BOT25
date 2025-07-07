"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "../Styles/ProductList.module.css";

type Product = {
  id: string;
  name: string;
  price: number;
  discount?: number;
  quantity?: number;
  imageUrl?: string;
};

const MAX_PRODUCTS = 10;
const DEFAULT_IMAGE = "https://via.placeholder.com/150?text=Producto";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      const normalized = data.map((p: any) => ({
        ...p,
        id: p.id || p._id || "", // seguridad extra para id
      }));
      setProducts(normalized);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los productos", "error");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setFormData(product);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({});
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((f) => ({
      ...f,
      [name]:
        name === "price" || name === "discount" || name === "quantity"
          ? Number(value)
          : value,
    }));
  }

  async function saveProduct() {
    if (!formData.name || !formData.price) {
      Swal.fire("Error", "Nombre y precio son obligatorios", "warning");
      return;
    }

    try {
      if (editingId) {
        // editar producto
        const res = await fetch(`http://localhost:5000/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("No se pudo actualizar");
        const updated = await res.json();
        updated.id = updated.id || updated._id || ""; // normalizar id
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? updated : p))
        );
        Swal.fire("Guardado", "Producto actualizado con éxito", "success");
        cancelEdit();
      } else {
        // crear producto nuevo
        if (products.length >= MAX_PRODUCTS) {
          Swal.fire(
            "Límite alcanzado",
            "Máximo 10 productos. Borra uno para agregar más.",
            "info"
          );
          return;
        }
        const res = await fetch("http://localhost:5000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("No se pudo crear producto");
        const nuevo = await res.json();
        nuevo.id = nuevo.id || nuevo._id || ""; // normalizar id
        setProducts((prev) => [...prev, nuevo]);
        Swal.fire("Guardado", "Producto creado con éxito", "success");
        setFormData({});
      }
    } catch (err) {
      Swal.fire("Error", (err as Error).message || "Error desconocido", "error");
    }
  }

  async function deleteProduct(id: string) {
    const result = await Swal.fire({
      title: "¿Querés borrar este producto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo borrar producto");
      setProducts((prev) => prev.filter((p) => p.id !== id));
      Swal.fire("Borrado", "Producto borrado con éxito", "success");
      if (editingId === id) cancelEdit();
    } catch (err) {
      Swal.fire("Error", (err as Error).message || "Error desconocido", "error");
    }
  }

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className={styles.container}>
      <h2>
        Tenés agregados <strong>{products.length}</strong> de <strong>{MAX_PRODUCTS}</strong> productos
      </h2>

      <div className={styles.grid}>
        {products.map((prod) => (
          <div key={prod.id} className={styles.card}>
            {editingId === prod.id ? (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className={styles.input}
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Precio"
                  value={formData.price ?? ""}
                  onChange={handleChange}
                  className={styles.input}
                  min={0}
                />
                <input
                  type="number"
                  name="discount"
                  placeholder="Descuento % (opcional)"
                  value={formData.discount ?? ""}
                  onChange={handleChange}
                  className={styles.input}
                  min={0}
                  max={100}
                />
                <input
                  type="number"
                  name="quantity"
                  placeholder="Cantidad (opcional)"
                  value={formData.quantity ?? ""}
                  onChange={handleChange}
                  className={styles.input}
                  min={0}
                />
                <div className={styles.actions}>
                  <button
                    onClick={saveProduct}
                    className={styles.saveBtn}
                    type="button"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className={styles.deleteBtn}
                    type="button"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <img
                  src={prod.imageUrl || DEFAULT_IMAGE}
                  alt={prod.name}
                  className={styles.image}
                />
                <div className={styles.info}>
                  <h3 className={styles.name}>{prod.name}</h3>
                  <p className={styles.price}>
                    ${prod.price.toFixed(2)}{" "}
                    {prod.discount ? (
                      <span className={styles.discount}>
                        -{prod.discount}%{" "}
                        <span className={styles.oferta}>Oferta</span>
                      </span>
                    ) : null}
                  </p>
                  {prod.quantity !== undefined && <p>Cantidad: {prod.quantity}</p>}
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => startEdit(prod)}
                    className={styles.editBtn}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteProduct(prod.id)}
                    className={styles.deleteBtn}
                    type="button"
                  >
                    Borrar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Formulario para agregar producto */}
        {(editingId === null || editingId === undefined) &&
          products.length < MAX_PRODUCTS && (
            <div key="add-form" className={styles.card}>
              <h3>Agregar Producto</h3>
              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name || ""}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="number"
                name="price"
                placeholder="Precio"
                value={formData.price ?? ""}
                onChange={handleChange}
                className={styles.input}
                min={0}
              />
              <input
                type="number"
                name="discount"
                placeholder="Descuento % (opcional)"
                value={formData.discount ?? ""}
                onChange={handleChange}
                className={styles.input}
                min={0}
                max={100}
              />
              <input
                type="number"
                name="quantity"
                placeholder="Cantidad (opcional)"
                value={formData.quantity ?? ""}
                onChange={handleChange}
                className={styles.input}
                min={0}
              />
              <button
                onClick={saveProduct}
                className={styles.saveBtn}
                type="button"
              >
                Guardar
              </button>
            </div>
          )}

        {/* Mensaje de límite alcanzado */}
        {products.length >= MAX_PRODUCTS && editingId === null && (
          <p key="full-message" className={styles.fullMessage}>
            Si deseas agregar otro producto, primero borra uno.
          </p>
        )}
      </div>
    </div>
  );
}
