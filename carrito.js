// carrito.js - VERSIÓN MEJORADA CON PRECIOS MAYORISTAS
class CarritoManager {
    constructor() {
        this.carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        this.init();
    }

    init() {
        this.actualizarContadorCarrito();
        this.agregarEventListeners();
        console.log('🛒 CarritoManager inicializado en:', window.location.pathname);
    }

    // 🛒 AGREGAR PRODUCTO AL CARRITO (CON LÓGICA DE PRECIOS MAYORISTAS)
    agregarProducto(producto) {
        // Verificar si ya existe en el carrito
        const existente = this.carrito.find(p => p.id === producto.id);
        
        if (existente) {
            // Actualizar cantidad del producto existente
            const nuevaCantidad = existente.cantidad + producto.cantidad;
            
            // Recalcular precio según la nueva cantidad total
            existente.cantidad = nuevaCantidad;
            existente.precio = this.calcularPrecioFinal(
                producto.precioUnitarioOriginal, 
                producto.precioMayorista, 
                producto.cantidadMinimaMayorista, 
                nuevaCantidad
            );
        } else {
            // Calcular precio final para el nuevo producto
            const precioFinal = this.calcularPrecioFinal(
                producto.precioUnitarioOriginal, 
                producto.precioMayorista, 
                producto.cantidadMinimaMayorista, 
                producto.cantidad
            );
            
            this.carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: precioFinal,
                precioUnitarioOriginal: producto.precioUnitarioOriginal,
                precioMayorista: producto.precioMayorista,
                cantidadMinimaMayorista: producto.cantidadMinimaMayorista,
                cantidad: producto.cantidad,
                imagen: producto.imagen || ''
            });
        }
        
        this.guardarCarrito();
        this.actualizarContadorCarrito();
        return this.carrito;
    }

    // 🧮 CALCULAR PRECIO FINAL SEGÚN CANTIDAD (MAYORISTA O MINORISTA)
    calcularPrecioFinal(precioMinorista, precioMayorista, cantidadMinima, cantidad) {
        // Si no hay precio mayorista o no se alcanza la cantidad mínima
        if (!precioMayorista || !cantidadMinima || cantidad < cantidadMinima) {
            return precioMinorista;
        }
        
        // Aplicar precio mayorista
        return precioMayorista;
    }

    // 🗑️ ELIMINAR PRODUCTO DEL CARRITO
    eliminarProducto(id) {
        this.carrito = this.carrito.filter(p => p.id !== id);
        this.guardarCarrito();
        this.actualizarContadorCarrito();
        
        // Si el modal está abierto, actualizarlo
        if (!document.getElementById('carritoModal').classList.contains('oculto')) {
            this.mostrarCarrito();
        }
        
        return this.carrito;
    }

    // 📋 OBTENER CARRITO COMPLETO
    obtenerCarrito() {
        return this.carrito;
    }

    // 💾 GUARDAR CARRITO EN LOCALSTORAGE
    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    // 🔢 ACTUALIZAR CONTADOR VISUAL
    actualizarContadorCarrito() {
        const contador = document.getElementById('contadorCarrito');
        if (contador) {
            const total = this.carrito.reduce((sum, p) => sum + p.cantidad, 0);
            contador.textContent = total;
            contador.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    // 🧮 CALCULAR TOTAL
    calcularTotal() {
        return this.carrito.reduce((total, p) => total + (p.precio * p.cantidad), 0);
    }

    // 🧹 VACIAR CARRITO
    vaciarCarrito() {
        this.carrito = [];
        this.guardarCarrito();
        this.actualizarContadorCarrito();
    }

    // 🎯 AGREGAR EVENT LISTENERS GLOBALES
    agregarEventListeners() {
        // Event delegation para botones "Agregar al carrito"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-carrito')) {
                this.handleAgregarCarrito(e);
            }
            
            // Eliminar producto desde el modal
            if (e.target.classList.contains('btn-eliminar')) {
                const id = e.target.dataset.id;
                this.eliminarProducto(id);
            }
        });

        // Cerrar modal al hacer clic fuera
        document.addEventListener('click', (e) => {
            const modal = document.getElementById('carritoModal');
            if (e.target === modal) {
                this.cerrarCarrito();
            }
        });

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarCarrito();
            }
        });
    }

    // 🖱️ MANEJAR CLIC EN BOTÓN "AGREGAR AL CARRITO" (CON PRECIOS MAYORISTAS)
    handleAgregarCarrito(e) {
        const btn = e.target;
        const card = btn.closest('.producto-card');
        const cantidadInput = card.querySelector('.cantidad-producto');
        
        // Validar que los datos existan
        if (!btn.dataset.id || !btn.dataset.nombre || !btn.dataset.precio) {
            console.error('Datos del producto incompletos', btn.dataset);
            this.mostrarNotificacion('Error: Producto no válido', 'error');
            return;
        }
        
        const producto = {
            id: btn.dataset.id,
            nombre: btn.dataset.nombre,
            precioUnitarioOriginal: parseFloat(btn.dataset.precio),
            precioMayorista: btn.dataset.precioMayorista ? parseFloat(btn.dataset.precioMayorista) : null,
            cantidadMinimaMayorista: btn.dataset.cantidadMinima ? parseInt(btn.dataset.cantidadMinima) : null,
            cantidad: parseInt(cantidadInput ? cantidadInput.value : 1),
            imagen: card.querySelector('img')?.src || ''
        };

        this.agregarProducto(producto);
        this.mostrarNotificacion(`¡${producto.nombre} agregado al carrito!`);
    }

    // 💫 MOSTRAR NOTIFICACIÓN
    mostrarNotificacion(mensaje, tipo = 'success') {
        // Eliminar notificación anterior si existe
        const notificacionAnterior = document.getElementById('notificacion-carrito');
        if (notificacionAnterior) {
            notificacionAnterior.remove();
        }

        const notificacion = document.createElement('div');
        notificacion.id = 'notificacion-carrito';
        const backgroundColor = tipo === 'error' ? '#dc3545' : '#28a745';
        
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        notificacion.textContent = mensaje;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.remove();
                }
            }, 300);
        }, 3000);
    }

    // 📤 MOSTRAR MODAL DEL CARRITO (CON INFO DE PRECIOS MAYORISTAS)
    mostrarCarrito() {
        const modal = document.getElementById('carritoModal');
        const contenido = document.getElementById('carritoContenido');
        const totalEl = document.getElementById('carritoTotal');
        
        if (!modal || !contenido) {
            console.error('Modal del carrito no encontrado');
            return;
        }

        document.body.style.overflow = 'hidden';
        
        contenido.innerHTML = this.carrito.length ? 
            this.carrito.map(p => {
                // Verificar si está aplicando precio mayorista
                const esPrecioMayorista = p.precioMayorista && 
                                         p.cantidadMinimaMayorista && 
                                         p.cantidad >= p.cantidadMinimaMayorista;
                
                return `
                    <div class="carrito-item">
                        <div class="carrito-info">
                            <strong>${p.nombre}</strong>
                            <div>Cantidad: ${p.cantidad}</div>
                            <div class="${esPrecioMayorista ? 'precio-mayorista-aplicado' : ''}">
                                Precio: $${p.precio.toFixed(2)} c/u
                                ${esPrecioMayorista ? ' (Mayorista)' : ''}
                            </div>
                            ${p.precioMayorista && p.cantidadMinimaMayorista ? 
                                `<small>Precio mayorista aplicable desde ${p.cantidadMinimaMayorista} unidades</small>` : 
                                ''
                            }
                        </div>
                        <div class="carrito-acciones">
                            <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
                            <button class="btn-eliminar" data-id="${p.id}">✕</button>
                        </div>
                    </div>
                `;
            }).join('') : 
            '<p class="carrito-vacio">Tu carrito está vacío</p>';

        const total = this.calcularTotal();
        if (totalEl) {
            totalEl.innerHTML = `
                <div class="total-pedido">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
            `;
        }

        modal.classList.remove('oculto');
    }

    // 📪 CERRAR MODAL DEL CARRITO
    cerrarCarrito() {
        const modal = document.getElementById('carritoModal');
        if (modal) {
            modal.classList.add('oculto');
            document.body.style.overflow = 'auto';
        }
    }

    // 📄 GENERAR PDF - VERSIÓN COMPLETA AUTOSUFICIENTE
    generarPDF() {
        console.log('Generando PDF...');
        
        if (typeof window.jspdf === 'undefined') {
            this.mostrarNotificacion('Error: La librería PDF no está disponible', 'error');
            return;
        }

        if (this.carrito.length === 0) {
            this.mostrarNotificacion('El carrito está vacío', 'error');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let y = margin;
            
            // Encabezado
            doc.setFillColor(64, 26, 91);
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text("AYB LIBRERÍA", pageWidth / 2, 15, { align: "center" });
            doc.setFontSize(12);
            doc.text("Todo para tu papelería y materiales escolares", pageWidth / 2, 25, { align: "center" });
            
            // Información del pedido
            y = 50;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text("RESUMEN DE PEDIDO", margin, y);
            
            doc.setFontSize(10);
            y += 10;
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, margin, y);
            doc.text(`Hora: ${new Date().toLocaleTimeString('es-AR')}`, pageWidth - margin, y, { align: "right" });
            
            y += 15;
            
            // Tabla de productos
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F');
            
            doc.setTextColor(64, 26, 91);
            doc.setFontSize(12);
            doc.text("Producto", margin + 5, y + 7);
            doc.text("Cant.", margin + 120, y + 7);
            doc.text("Precio", margin + 140, y + 7);
            doc.text("Total", margin + 170, y + 7);
            
            y += 12;
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            
            let totalGeneral = 0;
            
            this.carrito.forEach((producto, index) => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                
                const totalProducto = producto.precio * producto.cantidad;
                totalGeneral += totalProducto;
                
                // Limitar longitud del nombre para que quede bien en el PDF
                const nombre = producto.nombre.length > 30 
                    ? producto.nombre.substring(0, 27) + '...' 
                    : producto.nombre;
                
                doc.text(nombre, margin + 5, y);
                doc.text(producto.cantidad.toString(), margin + 120, y);
                
                // Marcar precio mayorista
                const esMayorista = producto.precioMayorista && 
                                   producto.cantidadMinimaMayorista && 
                                   producto.cantidad >= producto.cantidadMinimaMayorista;
                
                if (esMayorista) {
                    doc.setTextColor(39, 174, 96); // Verde para precios mayoristas
                }
                
                doc.text(`$${producto.precio.toFixed(2)}${esMayorista ? ' (M)' : ''}`, margin + 140, y);
                doc.setTextColor(0, 0, 0); // Volver al color negro
                doc.text(`$${totalProducto.toFixed(2)}`, margin + 170, y);
                
                y += 8;
            });
            
            // Total
            y += 10;
            doc.setDrawColor(64, 26, 91);
            doc.line(margin, y, pageWidth - margin, y);
            
            y += 10;
            doc.setFontSize(12);
            doc.setTextColor(64, 26, 91);
            doc.text("TOTAL GENERAL:", margin + 120, y);
            doc.text(`$${totalGeneral.toFixed(2)}`, margin + 170, y);
            
            // Información de contacto
            y += 25;
            doc.setFontSize(12);
            doc.setTextColor(64, 26, 91);
            doc.setFont(undefined, 'bold');
            doc.text("📞 ¿CÓMO CONFIRMAR SU PEDIDO?", pageWidth / 2, y, { align: "center" });
            
            y += 10;
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'normal');
            
            const instrucciones = [
                "1. Envíe este PDF por WhatsApp al (011) 1234-5678",
                "2. Le confirmaremos stock disponible y total final",
                "3. Coordinamos entrega a domicilio o retiro en local",
                "4. Formas de pago: Efectivo, transferencia o tarjeta"
            ];
            
            instrucciones.forEach(instruccion => {
                doc.text(instruccion, margin + 10, y);
                y += 7;
            });
            
            // Guardar
            const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
            doc.save(`Pedido_AYB_${fecha}_${Date.now()}.pdf`);
            
            this.mostrarNotificacion('PDF descargado correctamente');
            
        } catch (error) {
            console.error('Error al generar PDF:', error);
            this.mostrarNotificacion('Error al generar el PDF', 'error');
        }
    }
}

// 📦 INICIALIZAR CARRITO MANAGER GLOBAL
const carritoManager = new CarritoManager();

// 🌐 EXPONER FUNCIONES GLOBALES PARA HTML
window.mostrarCarrito = () => carritoManager.mostrarCarrito();
window.cerrarCarrito = () => carritoManager.cerrarCarrito();
window.generarPDFPedido = () => carritoManager.generarPDF();

// ✅ INICIALIZACIÓN AUTOMÁTICA
console.log('✅ carrito.js cargado - Listo para usar en todas las páginas');