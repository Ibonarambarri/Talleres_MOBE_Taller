document.addEventListener("DOMContentLoaded", function() {

    const contenedorPedidos = document.getElementById("contenedorPedidos");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");
    let piezaSeleccionadaId = null;

    // Delegación de eventos global para todas las piezas (tanto filtradas como iniciales)
    contenedorPedidos.addEventListener("click", function(event) {
        const piezaDiv = event.target.closest('.pieza');
        if (piezaDiv && piezaDiv.dataset.piezaId) {
            const piezaId = piezaDiv.dataset.piezaId;
            abrirDossier(piezaId);
        }
    });

    // Función para obtener datos y abrir modal
    function abrirDossier(piezaId) {
        fetch(`/pieza/${piezaId}`)
            .then(res => res.json())
            .then(abrirModal)
            .catch(err => console.error("Error:", err));
    }

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

        document.getElementById("guardarEstado").onclick = actualizarEstado;
        document.getElementById("closeModal").onclick = () => modal.style.display = "none";
    }

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
            location.reload(); // Actualiza la página después del cambio
        })
        .catch(err => console.error("Error al actualizar:", err));
    }
});
