// public-libreria.js - VERSIÓN CORREGIDA (SOLO CARGA DE PRODUCTOS)
import { app } from './firebase-config.js';
import {
    getFirestore,
    collection,
    getDocs
} from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const db = getFirestore(app);
const SUBCATEGORIAS = [
    "lápices", "lapiceras", "cuadernos", "correctores", 
    "fibras", "taco color", "folios"
];

// === FUNCIONES PRINCIPALES ===
async function loadPublicProducts() {
    try {
        const snapshot = await getDocs(collection(db, "productos"));
        const productos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        SUBCATEGORIAS.forEach(sub => {
            const id = `carrusel-${sub.replace(/\s/g, "-").toLowerCase()}`;
            const contenedor = document.querySelector(`#${id} .carrusel`);
            if (!contenedor) return;

            const filtrados = productos.filter(p => p.categorias && p.categorias.includes(sub));
            contenedor.innerHTML = filtrados.map(p => renderProductCard(p).outerHTML).join("");
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

function renderProductCard({ id, nombre, precio, imagen, hayStock }) {
    const card = document.createElement('div');
    card.className = 'producto-card';
    card.innerHTML = `
        <img src="${imagen}" alt="${nombre}" />
        <div class="info-producto">
            <h3>${nombre}</h3>
            <p class="precio">$${precio}</p>
            ${hayStock ? `
                <input type="number" min="1" value="1" class="cantidad-producto" data-id="${id}" />
                <button class="btn-carrito" 
                        data-id="${id}" 
                        data-nombre="${nombre}" 
                        data-precio="${precio}">
                    Agregar al carrito
                </button>
            ` : `<p class="sin-stock">Sin stock</p>`}
        </div>
    `;
    if (!hayStock) card.classList.add("sin-stock");
    return card;
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    loadPublicProducts();
    console.log('✅ public-libreria.js cargado - Solo carga de productos');
});