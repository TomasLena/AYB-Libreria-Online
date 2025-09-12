import { CATEGORIES } from "./config.js";

// ==================== FUNCIONES PARA IMGBB ====================

// Función para subir imagen a ImgBB (VERSIÓN MEJORADA)
async function subirImagen(archivo, esEdicion = false, imagenActual = '') {
  try {
    // 🔑 API Key de ImgBB
    const apiKey = 'ea8af12a1e8bc4aa7510dc606f3e9a2b';
    
    console.log('📤 Subiendo imagen a ImgBB...');
    
    // Si estamos en modo edición y no hay archivo, mantener imagen actual
    if (esEdicion && !archivo) {
      console.log('ℹ️ Modo edición - manteniendo imagen actual');
      return imagenActual;
    }
    
    // Si no hay archivo y no estamos editando, lanzar error
    if (!archivo) {
      throw new Error('No se proporcionó archivo de imagen');
    }
    
    const formData = new FormData();
    formData.append('image', archivo);
    
    // Subir a ImgBB
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      // Si falla la subida y estamos editando, mantener la imagen actual
      if (esEdicion && imagenActual) {
        console.warn('⚠️ Error al subir nueva imagen, manteniendo la anterior');
        return imagenActual;
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Imagen subida correctamente:', data.data.url);
      return data.data.url;
    } else {
      // Si falla y estamos editando, mantener la imagen actual
      if (esEdicion && imagenActual) {
        console.warn('⚠️ Error en respuesta de ImgBB, manteniendo imagen anterior');
        return imagenActual;
      }
      throw new Error('Error al subir imagen: ' + data.error.message);
    }
    
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error);
    
    // Si estamos editando y hay error, mantener la imagen actual si existe
    if (esEdicion && imagenActual) {
      console.warn('⚠️ Error de conexión, manteniendo imagen anterior');
      return imagenActual;
    }
    
    throw new Error('No se pudo subir la imagen: ' + error.message);
  }
}

// Función para vista previa de imagen
function configurarVistaPrevia() {
  const inputImagen = document.getElementById('imagen');
  const vistaPrevia = document.getElementById('vista-previa');
  const vistaPreviaImg = document.getElementById('vista-previa-img');
  
  if (inputImagen && vistaPrevia && vistaPreviaImg) {
    inputImagen.addEventListener('change', function(e) {
      const archivo = e.target.files[0];
      
      if (archivo) {
        // Validar tamaño (max 5MB)
        if (archivo.size > 5 * 1024 * 1024) {
          alert('❌ La imagen es demasiado grande. Máximo 5MB permitido.');
          this.value = '';
          vistaPrevia.style.display = 'none';
          return;
        }
        
        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!tiposPermitidos.includes(archivo.type)) {
          alert('❌ Formato de imagen no válido. Use JPG, PNG o WebP.');
          this.value = '';
          vistaPrevia.style.display = 'none';
          return;
        }
        
        // Mostrar vista previa
        const reader = new FileReader();
        reader.onload = function(e) {
          vistaPreviaImg.src = e.target.result;
          vistaPrevia.style.display = 'block';
        }
        reader.readAsDataURL(archivo);
      } else {
        vistaPrevia.style.display = 'none';
      }
    });
  }
}


// 🧭 Carrusel de productos (solo si existe en la página)
document.querySelectorAll('.carrusel-productos').forEach(carrusel => {
  const izquierda = carrusel.querySelector('.flecha.izquierda');
  const derecha = carrusel.querySelector('.flecha.derecha');
  const contenedor = carrusel.querySelector('.contenedor-productos');

  if (izquierda && derecha && contenedor) {
    izquierda.addEventListener('click', () => {
      contenedor.scrollBy({ left: -300, behavior: 'smooth' });
    });

    derecha.addEventListener('click', () => {
      contenedor.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
});

// 🔐 Login mejorado
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    const usuarioIngresado = document.getElementById("usuario").value.trim();
    const claveIngresada = document.getElementById("clave").value.trim();
    const mensaje = document.getElementById("login-message");

    if (usuarioIngresado === "admin" && claveIngresada === "1234") {
      // Guardar sesión con timestamp para mayor seguridad
      const sessionData = {
        logueado: true,
        timestamp: Date.now(),
        usuario: usuarioIngresado
      };
      
      localStorage.setItem("session", JSON.stringify(sessionData));
      window.location.href = "admin.html";
    } else {
      if (mensaje) {
        mensaje.textContent = "Usuario o contraseña incorrectos";
        mensaje.style.display = "block";
      } else {
        alert("Usuario o contraseña incorrectos");
      }
      
      // Limpiar el formulario
      loginForm.reset();
    }
  });
}

// Cerrar sesión mejorado
document.getElementById("cerrarSesion")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("session");
  window.location.href = "index.html";
});

// Verificación de sesión mejorada en admin.html
function verificarSesion() {
  const sessionData = JSON.parse(localStorage.getItem("session") || "{}");
  const ahora = Date.now();
  const tiempoExpiracion = 2 * 60 * 60 * 1000; // 2 horas
  
  if (!sessionData.logueado || (ahora - sessionData.timestamp) > tiempoExpiracion) {
    localStorage.removeItem("session");
    alert("Sesión expirada o inválida. Redirigiendo al login.");
    window.location.href = "login.html";
    return false;
  }
  
  return true;
}

// ⚠️ IMPORTANTE: Ejecutar verificación SI estamos en admin.html
if (window.location.pathname.includes("admin.html")) {
  // Verificar sesión inmediatamente
  if (!verificarSesion()) {
    // Detener cualquier otra ejecución
    document.body.innerHTML = "<h1 style='padding: 2rem; text-align: center;'>Redirigiendo al login...</h1>";
    // Opcional: redirigir después de un breve delay
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
}

// 🔥 Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiHUJNINl_NlkUFhdgI-XZq_kRn2tyYog",
  authDomain: "papeleria-ayb.firebaseapp.com",
  projectId: "papeleria-ayb",
  storageBucket: "papeleria-ayb.appspot.com",
  messagingSenderId: "169590579451",
  appId: "1:169590579451:web:a89b52bdc6f8a01908d05e"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Referencias al DOM
const productoForm = document.getElementById("productoForm");
const productosContainer = document.getElementById("productosContainer");
const submitBtn = document.getElementById("submitBtn");
const productIdInput = document.getElementById("productId");
const categoriasSelect = document.getElementById("categorias");

// Referencias modales (SOLO si existen en la página)
const btnToggleCategorias = document.getElementById("btnToggleCategorias");
const modalCategorias = document.getElementById("modalCategorias");
const categoriasGrid = document.getElementById("categoriasGrid");
const cancelCategorias = document.getElementById("cancelCategorias");
const confirmCategorias = document.getElementById("confirmCategorias");

// Configurar modal de categorías SOLO si los elementos existen
if (btnToggleCategorias && modalCategorias) {
  btnToggleCategorias.addEventListener("click", () => {
    renderCategoriasGrid();
    modalCategorias.classList.remove("hidden");
  });

  cancelCategorias.addEventListener("click", () => {
    modalCategorias.classList.add("hidden");
  });

  confirmCategorias.addEventListener("click", () => {
    const seleccionadas = Array.from(
      categoriasGrid.querySelectorAll(".categoria-item.selected")
    ).map(item => item.dataset.value);

    categoriasSelect.innerHTML = seleccionadas
      .map(cat => `<option value="${cat}" selected>${cat}</option>`)
      .join("");

    modalCategorias.classList.add("hidden");
  });
}

function renderCategoriasGrid() {
  if (!categoriasGrid) return;
  
  // Crear mapa de subcategorías para búsqueda rápida
  const subcategoriasMap = {};
  CATEGORIES.forEach(categoria => {
    categoria.subcategories.forEach(subcat => {
      if (!subcategoriasMap[subcat]) {
        subcategoriasMap[subcat] = [];
      }
      subcategoriasMap[subcat].push(categoria.name);
    });
  });

  categoriasGrid.innerHTML = CATEGORIES.map(cat => {
    const subItems = cat.subcategories.map(sub => `
      <div class="categoria-item" 
           data-value="${sub}" 
           data-categoria="${cat.name}"
           title="${subcategoriasMap[sub].length > 1 ? 'También en: ' + subcategoriasMap[sub].join(', ') : ''}">
        ${sub}
        ${subcategoriasMap[sub].length > 1 ? ' 🔄' : ''}
      </div>
    `).join("");

    return `
      <div class="categoria-bloque">
        <h4 class="categoria-titulo">${cat.name}</h4>
        <div class="categoria-subgrupo">${subItems}</div>
      </div>
    `;
  }).join("");

  // Configurar event listeners mejorados para selección múltiple
  categoriasGrid.addEventListener("click", e => {
    if (e.target.classList.contains("categoria-item")) {
      const subcategoria = e.target.dataset.value;
      
      // Verificar si esta subcategoría existe en múltiples categorías
      const categoriasConEstaSub = encontrarCategoriasConSubcategoria(subcategoria);
      
      if (categoriasConEstaSub.length > 1) {
        // Si existe en múltiples categorías, marcar/desmarcar todas
        toggleTodasLasOcurrencias(subcategoria);
      } else {
        // Si es única, toggle normal
        e.target.classList.toggle("selected");
      }
      
      actualizarCategoriasSeleccionadas();
    }
  });
  
  // Marcar visualmente las subcategorías duplicadas
  setTimeout(() => {
    marcarSubcategoriasDuplicadas();
  }, 100);
}

// ==================== FUNCIONES AUXILIARES ====================

// Función para encontrar todas las categorías que contienen una subcategoría
function encontrarCategoriasConSubcategoria(subcategoria) {
  const categorias = [];
  document.querySelectorAll('.categoria-item').forEach(item => {
    if (item.dataset.value === subcategoria) {
      categorias.push(item.dataset.categoria);
    }
  });
  return categorias;
}

// Función para marcar/desmarcar todas las ocurrencias de una subcategoría
function toggleTodasLasOcurrencias(subcategoria) {
  const todasLasOcurrencias = document.querySelectorAll(`.categoria-item[data-value="${subcategoria}"]`);
  const estaSeleccionada = todasLasOcurrencias[0].classList.contains('selected');
  
  todasLasOcurrencias.forEach(item => {
    if (estaSeleccionada) {
      item.classList.remove('selected');
    } else {
      item.classList.add('selected');
    }
  });
}

// Función para actualizar el select con las selecciones
function actualizarCategoriasSeleccionadas() {
  const seleccionadas = new Set();
  document.querySelectorAll('.categoria-item.selected').forEach(item => {
    seleccionadas.add(item.dataset.value);
  });
  
  const categoriasSelect = document.getElementById("categorias");
  if (categoriasSelect) {
    categoriasSelect.innerHTML = Array.from(seleccionadas)
      .map(cat => `<option value="${cat}" selected>${cat}</option>`)
      .join("");
  }
}

// Función para identificar y marcar subcategorías duplicadas
function marcarSubcategoriasDuplicadas() {
  const subcategoriasCount = {};
  
  // Contar ocurrencias de cada subcategoría
  CATEGORIES.forEach(categoria => {
    categoria.subcategories.forEach(subcat => {
      subcategoriasCount[subcat] = (subcategoriasCount[subcat] || 0) + 1;
    });
  });
  
  // Marcar visualmente las duplicadas
  document.querySelectorAll('.categoria-item').forEach(item => {
    const subcategoria = item.dataset.value;
    if (subcategoriasCount[subcategoria] > 1) {
      item.classList.add('con-duplicados');
    }
  });
}

// Función para renderizar el select multiple (MANTENER ESTA TAL CUAL)
function renderCategoriasSelect() {
  if (!categoriasSelect) return;
  
  categoriasSelect.innerHTML = CATEGORIES
    .map(cat => {
      const options = cat.subcategories
        .map(sub => `<option value="${sub}">${sub}</option>`)
        .join("");
      return `<optgroup label="${cat.name}">${options}</optgroup>`;
    })
    .join("");
}

// Listar productos (READ) - ¡SOLO UNA VEZ!
async function renderizarProductos() {
  if (!productosContainer) return;
  
  productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>Cargando productos...</p>";
  
  try {
    const snap = await getDocs(collection(db, "productos"));
    
    if (snap.empty) {
      productosContainer.innerHTML = "<p style='text-align: center; padding: 20px;'>No hay productos en la base de datos.</p>";
      return;
    }

    productosContainer.innerHTML = "";
    
    snap.forEach(docSnap => {
      const p = docSnap.data();
      const id = docSnap.id;

      const card = document.createElement("div");
      card.className = "producto-card";
      card.dataset.id = id;
      
      // Añadir clase si no hay stock
      if (!p.hayStock) {
        card.classList.add("sin-stock");
      }
      
      card.innerHTML = `
  <div class="producto-imagen">
    <img src="${p.imagen}" alt="${p.nombre}" />
  </div>
  <div class="producto-info">
    <h3>${p.nombre}</h3>
    
    <div class="precios-container">
      <div class="precio-minorista">
        <span class="precio-label">💲 Precio Unitario:</span>
        <span class="precio-valor">$${p.precio}</span>
      </div>
      
      ${p.precioMayorista ? `
        <div class="precio-mayorista">
          <span class="precio-label">🏪 Precio Mayorista:</span>
          <span class="precio-valor">$${p.precioMayorista}</span>
          <small class="cantidad-minima">(Mín. ${p.cantidadMinimaMayorista} unidades)</small>
        </div>
        <div class="ahorro-mayorista">
          ⚡ Ahorras: $${(p.precio - p.precioMayorista).toFixed(2)} por unidad
        </div>
      ` : ''}
    </div>
    
    <p class="categorias-producto">📦 ${Array.isArray(p.categorias) ? p.categorias.join(", ") : p.categoria || ""}</p>
    <p class="stock-info ${p.hayStock ? 'en-stock' : 'sin-stock'}">
      ${p.hayStock ? '✅ En stock' : '❌ Sin stock'}
    </p>
    
    <div class="acciones-producto">
      <button class="edit-btn" data-id="${id}">✏️ Editar</button>
      <button class="eliminar-btn" data-id="${id}">🗑️ Eliminar</button>
    </div>
  </div>
`;
      productosContainer.appendChild(card);
    });
    
    // Inicializar filtros después de renderizar productos
    inicializarFiltros();
    
  } catch (error) {
    console.error("Error al cargar productos:", error);
    productosContainer.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">Error al cargar productos: ${error.message}</p>`;
  }
}

// Manejar clicks de Editar y Eliminar
if (productosContainer) {
  productosContainer.addEventListener("click", async e => {
    const id = e.target.dataset.id;
    if (!id) return;

    // Eliminar
    if (e.target.classList.contains("eliminar-btn")) {
      if (confirm("¿Seguro deseas eliminar este producto?")) {
        await deleteDoc(doc(db, "productos", id));
        renderizarProductos();
      }
      return;
    }

    // Editar
    if (e.target.classList.contains("edit-btn")) {
      const snap = await getDoc(doc(db, "productos", id));
      const data = snap.data();

      productIdInput.value = id;
      document.getElementById("nombre").value = data.nombre;
      document.getElementById("precio").value = data.precio;
      document.getElementById("hayStock").checked = data.hayStock ?? true;

      // Precargar múltiples categorías
      categoriasSelect.querySelectorAll("option").forEach(opt => {
        opt.selected = Array.isArray(data.categorias)
          ? data.categorias.includes(opt.value)
          : false;
      });

      submitBtn.textContent = "Guardar cambios";
      
      // ✅ NUEVO: Guardar la URL de la imagen actual para no pedirla de nuevo
      document.getElementById("imagen").dataset.currentImage = data.imagen;
      
      // ✅ Mostrar vista previa de la imagen actual
      const vistaPrevia = document.getElementById("vista-previa");
      const vistaPreviaImg = document.getElementById("vista-previa-img");
      if (vistaPrevia && vistaPreviaImg && data.imagen) {
        vistaPreviaImg.src = data.imagen;
        vistaPrevia.style.display = "block";
      }
      
      // ✅ Actualizar UI para modo edición (imagen opcional)
      actualizarUIParaEdicion(true);
    }
  });
}

// Crear / Actualizar producto (CREATE + UPDATE) - CON IMGBB
if (productoForm) {
  productoForm.addEventListener("submit", async e => {
    e.preventDefault();

    // Mostrar loading
    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const loadingSpinner = document.getElementById("loadingSpinner");
    
    if (submitText && loadingSpinner) {
      submitText.textContent = "Guardando...";
      loadingSpinner.style.display = "inline-block";
    }
    if (submitBtn) submitBtn.disabled = true;

    try {
      const id = productIdInput.value.trim();
      const nombre = document.getElementById("nombre").value.trim();
      const precio = parseFloat(document.getElementById("precio").value);
      const archivoImagen = document.getElementById("imagen").files[0];
      const hayStock = document.getElementById("hayStock").checked;

      // Validaciones básicas
      if (!nombre || isNaN(precio)) {
        throw new Error("Completa todos los campos obligatorios");
      }

      // Validar imagen (solo si es producto nuevo)
      if (!archivoImagen && !id) {
        throw new Error("Selecciona una imagen para el producto");
      }

      // Si es edición y no hay nueva imagen, usar la imagen actual
      const imagenActual = document.getElementById("imagen").dataset.currentImage || '';

      // SUBIR IMAGEN A IMGBB (pasa parámetros de edición)
      let imagenUrl = await subirImagen(archivoImagen, !!id, imagenActual);

      // Leemos el array de categorías seleccionadas
      const categorias = Array.from(categoriasSelect.selectedOptions)
                              .map(o => o.value);

      if (categorias.length === 0) {
        throw new Error("Selecciona al menos una categoría");
      }

      // Precio mayorista (opcional)
      const habilitarMayorista = document.getElementById("habilitarMayorista")?.checked || false;
      const precioMayorista = habilitarMayorista ? 
        parseFloat(document.getElementById("precioMayorista").value) : null;
      const cantidadMinimaMayorista = habilitarMayorista ? 
        parseInt(document.getElementById("cantidadMinimaMayorista").value) : null;

      // Validaciones mayorista
      if (habilitarMayorista) {
        if (!precioMayorista || isNaN(precioMayorista)) {
          throw new Error("Ingresa un precio mayorista válido");
        }
        if (precioMayorista >= precio) {
          throw new Error("El precio mayorista debe ser menor al precio normal");
        }
        if (!cantidadMinimaMayorista || cantidadMinimaMayorista < 2) {
          throw new Error("La cantidad mínima mayorista debe ser al menos 2 unidades");
        }
      }

      const payload = { 
        nombre, 
        precio, 
        categorias, 
        hayStock,
        timestamp: Date.now(),
        precioMayorista: habilitarMayorista ? precioMayorista : null,
        cantidadMinimaMayorista: habilitarMayorista ? cantidadMinimaMayorista : null
      };

      // Agregar la URL de la imagen al payload
      if (imagenUrl) {
        payload.imagen = imagenUrl;
      }

      if (id) {
        await updateDoc(doc(db, "productos", id), payload);
        alert("✅ Producto actualizado correctamente");
      } else {
        await addDoc(collection(db, "productos"), payload);
        alert("✅ Producto agregado correctamente");
      }

      // Reset del formulario
      productoForm.reset();
      productIdInput.value = "";
      if (submitText) submitText.textContent = "Agregar producto";
      document.getElementById("hayStock").checked = true;
      
      // Limpiar vista previa y estado de imagen
      resetearFormularioImagen();

      renderizarProductos();

    } catch (error) {
      console.error("Error:", error);
      alert("❌ " + error.message);
    } finally {
      if (submitText) submitText.textContent = "Agregar producto";
      if (loadingSpinner) loadingSpinner.style.display = "none";
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

// Variables para filtros
let filtroCategoriaActual = 'todas';
let filtroSubcategoriaActual = 'todas';
let filtroStockActual = 'todos';

// Función para inicializar los filtros
function inicializarFiltros() {
  const filtroCategoria = document.getElementById('filtroCategoria');
  const filtroSubcategoria = document.getElementById('filtroSubcategoria');
  const filtroStock = document.getElementById('filtroStock');
  const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
  const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
  
  // Si no existen los elementos de filtro, salir
  if (!filtroCategoria || !filtroSubcategoria || !filtroStock) return;
  
  // Event listeners para los filtros
  filtroCategoria.addEventListener('change', function() {
    actualizarOpcionesSubcategorias(this.value);
  });
  
  if (btnAplicarFiltros) btnAplicarFiltros.addEventListener('click', aplicarFiltros);
  if (btnLimpiarFiltros) btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
  
  // Inicializar opciones de subcategorías
  actualizarOpcionesSubcategorias('todas');
}

// Actualizar opciones de subcategorías según la categoría seleccionada
function actualizarOpcionesSubcategorias(categoriaSlug) {
  const filtroSubcategoria = document.getElementById('filtroSubcategoria');
  if (!filtroSubcategoria) return;
  
  // Limpiar opciones actuales (excepto la primera)
  filtroSubcategoria.innerHTML = '<option value="todas">Todas las subcategorías</option>';
  
  // Si se selecciona "todas", no agregar más opciones
  if (categoriaSlug === 'todas') return;
  
  // Encontrar la categoría seleccionada
  const categoria = CATEGORIES.find(cat => cat.slug === categoriaSlug);
  if (!categoria) return;
  
  // Agregar las subcategorías de la categoría seleccionada
  categoria.subcategories.forEach(subcat => {
    const option = document.createElement('option');
    option.value = subcat;
    option.textContent = subcat;
    filtroSubcategoria.appendChild(option);
  });
}

// Aplicar los filtros seleccionados
function aplicarFiltros() {
  const filtroCategoria = document.getElementById('filtroCategoria');
  const filtroSubcategoria = document.getElementById('filtroSubcategoria');
  const filtroStock = document.getElementById('filtroStock');
  
  if (!filtroCategoria || !filtroSubcategoria || !filtroStock) return;
  
  filtroCategoriaActual = filtroCategoria.value;
  filtroSubcategoriaActual = filtroSubcategoria.value;
  filtroStockActual = filtroStock.value;
  
  // Aplicar filtros a los productos visibles
  const productos = document.querySelectorAll('.producto-card');
  let productosVisibles = 0;
  
  productos.forEach(producto => {
    // Obtener datos del producto
    const categoriasTexto = producto.querySelector('.categorias-producto')?.textContent || '';
    const tieneStock = !producto.querySelector('.stock-info')?.textContent.includes('Sin stock');
    
    // Verificar si pasa los filtros
    let pasaFiltroCategoria = true;
    let pasaFiltroSubcategoria = true;
    let pasaFiltroStock = true;
    
    // Filtro por categoría principal
    if (filtroCategoriaActual !== 'todas') {
      const categoriaEncontrada = CATEGORIES.find(cat => cat.slug === filtroCategoriaActual);
      if (categoriaEncontrada) {
        pasaFiltroCategoria = categoriaEncontrada.subcategories.some(subcat => 
          categoriasTexto.includes(subcat)
        );
      }
    }
    
    // Filtro por subcategoría específica
    if (filtroSubcategoriaActual !== 'todas') {
      pasaFiltroSubcategoria = categoriasTexto.includes(filtroSubcategoriaActual);
    }
    
    // Filtro por stock
    if (filtroStockActual === 'conStock') {
      pasaFiltroStock = tieneStock;
    } else if (filtroStockActual === 'sinStock') {
      pasaFiltroStock = !tieneStock;
    }
    
    // Mostrar u ocultar según los filtros
    if (pasaFiltroCategoria && pasaFiltroSubcategoria && pasaFiltroStock) {
      producto.classList.remove('filtrado');
      productosVisibles++;
    } else {
      producto.classList.add('filtrado');
    }
  });
  
  // Mostrar mensaje si no hay productos que coincidan
  mostrarMensajeFiltros(productosVisibles);
}

// Mostrar mensaje cuando no hay productos que coincidan con los filtros
function mostrarMensajeFiltros(cantidad) {
  // Eliminar mensaje anterior si existe
  const mensajeAnterior = document.getElementById('mensajeFiltros');
  if (mensajeAnterior) {
    mensajeAnterior.remove();
  }
  
  if (cantidad === 0) {
    const mensaje = document.createElement('div');
    mensaje.id = 'mensajeFiltros';
    mensaje.style.padding = '15px';
    mensaje.style.margin = '15px 0';
    mensaje.style.backgroundColor = '#fff3cd';
    mensaje.style.border = '1px solid #ffeaa7';
    mensaje.style.borderRadius = '5px';
    mensaje.style.color = '#856404';
    mensaje.textContent = 'No se encontraron productos que coincidan con los filtros seleccionados.';
    
    const productosContainer = document.getElementById('productosContainer');
    if (productosContainer && productosContainer.parentNode) {
      productosContainer.parentNode.insertBefore(mensaje, productosContainer);
    }
  }
}

// Limpiar todos los filtros
function limpiarFiltros() {
  const filtroCategoria = document.getElementById('filtroCategoria');
  const filtroSubcategoria = document.getElementById('filtroSubcategoria');
  const filtroStock = document.getElementById('filtroStock');
  
  if (!filtroCategoria || !filtroSubcategoria || !filtroStock) return;
  
  filtroCategoria.value = 'todas';
  filtroSubcategoria.value = 'todas';
  filtroStock.value = 'todos';
  
  filtroCategoriaActual = 'todas';
  filtroSubcategoriaActual = 'todas';
  filtroStockActual = 'todos';
  
  // Eliminar mensaje de filtros si existe
  const mensajeFiltros = document.getElementById('mensajeFiltros');
  if (mensajeFiltros) {
    mensajeFiltros.remove();
  }
  
  // Mostrar todos los productos
  const productos = document.querySelectorAll('.producto-card');
  productos.forEach(producto => {
    producto.classList.remove('filtrado');
  });
}

// Función para actualizar la interfaz al editar
function actualizarUIParaEdicion(tieneImagen) {
  const imagenInput = document.getElementById("imagen");
  const ayudaImagen = document.getElementById("imagen-texto-ayuda");
  const textoEstado = document.getElementById("texto-estado-imagen");
  
  if (tieneImagen) {
    // Modo edición - imagen opcional
    imagenInput.removeAttribute("required");
    if (ayudaImagen) {
      ayudaImagen.innerHTML = "Formatos: JPG, PNG, WebP. Máx. 5MB. <span style='color: #28a745;'>✓ Opcional (usará la actual)</span>";
    }
    if (textoEstado) {
      textoEstado.textContent = "Imagen actual - Subir nueva solo si deseas cambiarla";
      textoEstado.style.color = "#28a745";
    }
  } else {
    // Modo nuevo - imagen requerida
    imagenInput.setAttribute("required", "true");
    if (ayudaImagen) {
      ayudaImagen.innerHTML = "Formatos: JPG, PNG, WebP. Máx. 5MB. <span style='color: #dc3545;'>* Requerido</span>";
    }
    if (textoEstado) {
      textoEstado.textContent = "Selecciona una imagen para el producto";
      textoEstado.style.color = "#666";
    }
  }
}

// Función para resetear el estado de la imagen al guardar/cancelar
function resetearFormularioImagen() {
  const imagenInput = document.getElementById("imagen");
  const vistaPrevia = document.getElementById("vista-previa");
  
  if (imagenInput) {
    imagenInput.value = "";
    imagenInput.removeAttribute("data-current-image");
  }
  
  if (vistaPrevia) {
    vistaPrevia.style.display = "none";
  }
  
  // Volver al estado inicial (imagen requerida)
  actualizarUIParaEdicion(false);
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  renderCategoriasSelect();
  renderizarProductos();
});

// Inicializar vista previa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  configurarVistaPrevia();
});

// ✅ EXPORTAR app para que esté disponible globalmente
export { app };