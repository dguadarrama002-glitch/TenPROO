// ======================= app.js =======================
// Chicos: lógica del "Hacer pedido" para playeras.
// Lee el formulario, calcula total (modelo * cantidad + extras + envío)
// y muestra un resumen. Está escrito paso a paso y con comentarios.

/** Utilidad: formatea a moneda MXN */
function toMXN(num) {
    return Number(num || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

/** Utilidad: toma precio desde data-precio (en selects/checks) */
function getPrecioFromDataset(el) {
    const raw = el?.dataset?.precio;
    return raw ? Number(raw) : 0;
}

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos que usaremos:
    const form = document.getElementById('formPedido');
    const outNombre = document.getElementById('outNombre');
    const outLista = document.getElementById('outLista');
    const outTotal = document.getElementById('outTotal');
    const btnConfirmar = document.getElementById('btnConfirmar');
    const confirmNombre = document.getElementById('confirmNombre');

    // Toast UX (aviso corto)
    const toastBtn = document.getElementById('btnToast');
    const toastEl = document.getElementById('toastAviso');
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toastBtn.addEventListener('click', () => toast.show());

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita recargar la página

        // 1) Leemos campos base
        const nombre = document.getElementById('nombreCliente').value.trim();
        const selModelo = document.getElementById('selModelo');
        const selTalla = document.getElementById('selTalla');
        const selColor = document.getElementById('selColor');
        const cantidad = Number(document.getElementById('inpCantidad').value || 0);

        // Validación mínima:
        if (!nombre || !selModelo.value || !selTalla.value || !selColor.value || cantidad < 1) {
            alert('Completa nombre, modelo, talla, color y cantidad (mínimo 1).');
            return;
        }

        // 2) Precios base
        const optModelo = selModelo.options[selModelo.selectedIndex];
        const precioModelo = getPrecioFromDataset(optModelo); // precio unitario del modelo
        let total = precioModelo * cantidad;

        // 3) Extras / personalización
        const chkNombreNumero = document.getElementById('chkNombreNumero');
        const chkParcheLiga = document.getElementById('chkParcheLiga');

        const extrasSeleccionados = [];
        if (chkNombreNumero.checked) {
            total += getPrecioFromDataset(chkNombreNumero) * cantidad; // costo por prenda
            extrasSeleccionados.push('Nombre y número');
        }
        if (chkParcheLiga.checked) {
            total += getPrecioFromDataset(chkParcheLiga) * cantidad; // costo por prenda
            extrasSeleccionados.push('Parche de liga');
        }

        // Campos condicionales (solo se muestran en resumen si tienen contenido)
        const inpNombre = document.getElementById('inpNombre').value.trim();
        const inpNumero = document.getElementById('inpNumero').value.trim();

        // 4) Envío e instrucciones
        const selEnvio = document.getElementById('selEnvio');
        const optEnvio = selEnvio.options[selEnvio.selectedIndex];
        const costoEnvio = getPrecioFromDataset(optEnvio);
        total += costoEnvio;

        const txtInstr = document.getElementById('txtInstrucciones').value.trim();

        // 5) Pintamos resumen
        outNombre.textContent = nombre;

        // Lista HTML del pedido
        outLista.innerHTML = `
      <li><strong>Modelo:</strong> ${selModelo.value} — ${toMXN(precioModelo)} c/u × ${cantidad}</li>
      <li><strong>Talla:</strong> ${selTalla.value}</li>
      <li><strong>Color:</strong> ${selColor.value}</li>
      <li><strong>Extras:</strong> ${extrasSeleccionados.length ? extrasSeleccionados.join(', ') : 'Ninguno'}</li>
      ${inpNombre || inpNumero ? `<li><strong>Personalización:</strong> ${inpNombre ? 'Nombre: ' + inpNombre : ''} ${inpNumero ? ' | Número: ' + inpNumero : ''}</li>` : ''}
      <li><strong>Envío:</strong> ${selEnvio.value} — ${toMXN(costoEnvio)}</li>
      ${txtInstr ? `<li><strong>Instrucciones:</strong> ${txtInstr}</li>` : ''}
    `;

        outTotal.textContent = toMXN(total);

        // Habilitamos confirmar y pasamos nombre al modal
        btnConfirmar.disabled = false;
        confirmNombre.textContent = nombre;
    });

    // Reset: limpiar también el resumen
    form.addEventListener('reset', () => {
        setTimeout(() => {
            outNombre.textContent = '—';
            outLista.innerHTML = '<li class="text-muted">Aún no has generado tu pedido.</li>';
            outTotal.textContent = '$0';
            btnConfirmar.disabled = true;
        }, 0);
    });
});
// ===================== /app.js ======================
// ======= WhatsApp flotante: mostrar tras scroll + mensaje por horario =======
document.addEventListener('DOMContentLoaded', () => {
    const waBtn = document.querySelector('.whatsapp-float');
    if (!waBtn) return; // Si no hay botón en la página, salimos

    // 1) Mensaje dinámico según hora local (9 a 18 h "en línea")
    const h = new Date().getHours();
    const enHorario = h >= 9 && h < 18;
    const msg = enHorario ? '¡Respondo ahora!' : 'Fuera de horario, te contesto pronto';
    
    // CORRECCIÓN: Uso correcto de Template Literals (con backticks `)
    waBtn.title = `WhatsApp — ${msg}`;
    waBtn.setAttribute('aria-label', `Chatea por WhatsApp — ${msg}`);

    // (Opcional) Prefill del texto en el chat
    // CORRECCIÓN: Número de WhatsApp real y mensaje de contexto de TenPRO
    const telefono = '525586883890'; // 52 + 10 dígitos (México)
    const texto = encodeURIComponent('Hola, vengo del sitio de TenPRO. Me interesa información sobre los cursos.');
    
    // CORRECCIÓN: Uso correcto de Template Literals (con backticks `)
    waBtn.href = `https://wa.me/${telefono}?text=${texto}`;

    // 2) Mostrar/ocultar por scroll (aparece al bajar 300px)
    const UMBRAL = 300;
    const toggleWA = () => {
        if (window.scrollY > UMBRAL) {
            waBtn.classList.add('show');
        } else {
            waBtn.classList.remove('show');
        }
    };

    // Estado inicial y listener
    toggleWA();
    window.addEventListener('scroll', toggleWA, { passive: true });
});

// ======================= app.js =======================

// Inicialización del carrito
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Elementos del DOM
const listaCarrito = document.getElementById("listaCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const contadorCarrito = document.getElementById("contadorCarrito");
const btnVaciar = document.getElementById("btnVaciar");
const btnComprar = document.getElementById("btnComprar");

// Función: actualizar carrito visualmente
function actualizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    li.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        <small class="text-muted">$${item.precio} x ${item.cantidad}</small>
      </div>
      <div>
        <span class="fw-semibold">$${item.precio * item.cantidad}</span>
        <button class="btn btn-sm btn-danger ms-2 btnEliminar" data-index="${index}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    listaCarrito.appendChild(li);
    total += item.precio * item.cantidad;
  });

  totalCarrito.textContent = `$${total}`;
  contadorCarrito.textContent = carrito.length;
  localStorage.setItem("carrito", JSON.stringify(carrito));

  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = e.currentTarget.dataset.index;
      carrito.splice(i, 1);
      actualizarCarrito();
    });
  });
}

// Función: agregar producto
function agregarProducto(nombre, precio) {
  const existente = carrito.find(p => p.nombre === nombre);
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ nombre, precio: Number(precio), cantidad: 1 });
  }
  actualizarCarrito();
}

// Botones "Agregar al carrito"
document.querySelectorAll(".btnAgregar").forEach(btn => {
  btn.addEventListener("click", e => {
    const nombre = e.currentTarget.dataset.nombre;
    const precio = e.currentTarget.dataset.precio;
    agregarProducto(nombre, precio);
  });
});

// Vaciar carrito
btnVaciar.addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
});

// Comprar
btnComprar.addEventListener("click", () => {
  if (carrito.length === 0) return alert("El carrito está vacío.");
  alert("¡Gracias por tu compra en TenPRO!");
  carrito = [];
  actualizarCarrito();
});

// Inicializa la vista
actualizarCarrito();
// ================== Agregar botones de "Agregar al carrito" ==================
document.addEventListener('DOMContentLoaded', () => {
  // Seleccionamos todas las cards de cursos
  const cards = document.querySelectorAll('#catalogo .card');

  cards.forEach(card => {
    // Creamos un botón dentro de la card-body si no existe
    const body = card.querySelector('.card-body');
    if (!body) return;

    const titulo = card.querySelector('.card-title')?.textContent || 'Curso';
    const precioTexto = card.querySelector('.text-success')?.textContent || '$0';
    const precio = Number(precioTexto.replace(/[^0-9.-]+/g,"")); // Extrae número

    const btnAgregar = document.createElement('button');
    btnAgregar.textContent = 'Agregar al carrito';
    btnAgregar.className = 'btn btn-sm btn-success mt-2';
    body.appendChild(btnAgregar);

    btnAgregar.addEventListener('click', () => {
      agregarProducto(titulo, precio);
      // Opcional: alerta o toast
      const toast = bootstrap.Toast.getOrCreateInstance(document.createElement('div'));
      console.log(`Agregaste: ${titulo} — ${precioTexto}`);
    });
  });
});
