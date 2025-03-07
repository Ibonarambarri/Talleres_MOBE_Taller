document.addEventListener("DOMContentLoaded", function() {
    const btnToggleFiltros = document.getElementById("btnToggleFiltros");
    const filtroOpciones = document.getElementById("filtroOpciones");
    const formFiltro = document.getElementById("formFiltro");
    const contenedorPedidos = document.getElementById("contenedorPedidos");
    const tituloResultados = document.getElementById("tituloResultados");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");
    let piezaSeleccionadaId = null;

    // Alternar visibilidad del formulario de filtros
    btnToggleFiltros.addEventListener("click", () => {
        if (filtroOpciones.style.display === "none") {
            filtroOpciones.style.display = "flex";
            btnToggleFiltros.textContent = "Ocultar Filtros";
        } else {
            filtroOpciones.style.display = "none";
            btnToggleFiltros.textContent = "Mostrar Filtros";
        }
    });

    // Filtrar piezas
    formFiltro.addEventListener("submit", function(event) {
        event.preventDefault();

        const queryString = new URLSearchParams(new FormData(formFiltro)).toString();
        fetch(`/buscar?${queryString}`)
            .then(res => res.json())
            .then(actualizarListaPiezas)
            .catch(err => console.error("Error al buscar piezas:", err));
    });

    // Actualizar piezas filtradas
    function actualizarListaPiezas(piezas) {
        contenedorPedidos.innerHTML = "";

        if (!piezas.length) {
            tituloResultados.textContent = "No se encontraron piezas";
            contenedorPedidos.innerHTML = "<p>No hay resultados para la búsqueda.</p>";
            return;
        }

        tituloResultados.textContent = "Piezas que coinciden con la búsqueda";

        piezas.forEach(pieza => {
    const div = document.createElement('div');
    div.classList.add('pieza');
    div.setAttribute('data-pieza-id', pieza.id);  // <-- Esto es crucial
    div.innerHTML = `
        <h2 class="pieza-referencia">${pieza.ref_pieza}</h2>
        <p><strong>REF Pedido:</strong> ${pieza.ref_pedido}</p>
        <p><strong>Fecha:</strong> ${pieza.fecha}</p>
        <p><strong>Material:</strong> ${pieza.material} - <strong>Espesor:</strong> ${pieza.espesor} mm</p>
        <p><strong>Color:</strong> ${pieza.color}</p>
        <p><strong>Estado:</strong> ${pieza.estado}</p>
    `;
    contenedorPedidos.appendChild(div);
});

    }

    // Delegación de eventos para abrir modal al hacer clic en una pieza
    contenedorPedidos.addEventListener("click", function(event) {
        const piezaDiv = event.target.closest('.pieza');
        if (piezaDiv) {
            const piezaId = piezaDiv.dataset.piezaId;
            fetch(`/pieza/${piezaId}`)
                .then(res => res.json())
                .then(abrirModal)
                .catch(err => console.error("Error al obtener pieza:", err));
        }
    });

    // Abrir modal con detalles de la pieza
    function abrirModal(pieza) {
        piezaSeleccionadaId = pieza.id;
        modal.style.display = "block";
        modalContent.innerHTML = `
            <span id="closeModal" class="close">&times;</span>
            <h2>${pieza.referencia}</h2>
            <p><strong>REF Pedido:</strong> ${pieza.ref_pedido}</p>
            <p><strong>Fecha:</strong> ${pieza.fecha}</p>
            <p><strong>Material:</strong> ${pieza.material} - <strong>Espesor:</strong> ${pieza.espesor} mm</p>
            <p><strong>Color:</strong> ${pieza.color}</p>
            <p><strong>Estado Actual:</strong> ${pieza.estado_produccion}</p>

            <label>Actualizar Estado:</label>
            <select id="estadoPieza">
                <option value="pendiente">Pendiente</option>
                <option value="cortado">Cortado</option>
                <option value="doblado">Doblado</option>
                <option value="punzonado">Punzonado</option>
                <option value="entregado">Entregado</option>
            </select>
            <button id="guardarEstado">Guardar</button>
        `;

        // Evento para guardar cambios
        document.getElementById("guardarEstado").onclick = actualizarEstado;
        document.getElementById("closeModal").onclick = () => modal.style.display = "none";
    }

    // Actualizar estado de pieza
    function actualizarEstado() {
        const nuevoEstado = document.getElementById("estadoPieza").value;
        fetch(`/actualizar_estado/${piezaSeleccionadaId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.mensaje);
            modal.style.display = "none";
            formFiltro.dispatchEvent(new Event('submit')); // recargar piezas
        })
        .catch(err => console.error("Error al actualizar:", err));
    }
});
