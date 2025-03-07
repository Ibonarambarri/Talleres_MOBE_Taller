document.addEventListener("DOMContentLoaded", function () {
    const btnToggleFiltros = document.getElementById("btnToggleFiltros");
    const filtroOpciones = document.getElementById("filtroOpciones");
    const formFiltro = document.getElementById("formFiltro");
    const contenedorPedidos = document.getElementById("contenedorPedidos");
    const tituloResultados = document.getElementById("tituloResultados");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modalContent");
    let piezaSeleccionadaId = null;

    btnToggleFiltros.addEventListener("click", () => {
        filtroOpciones.style.display = filtroOpciones.style.display === "none" ? "flex" : "none";
        btnToggleFiltros.textContent = filtroOpciones.style.display === "none" ? "Mostrar Filtros" : "Ocultar Filtros";
    });

    formFiltro.addEventListener("submit", function (event) {
        event.preventDefault();
        const queryString = new URLSearchParams(new FormData(formFiltro)).toString();
        fetch(`/buscar?${queryString}`)
            .then(res => res.json())
            .then(actualizarListaPiezas)
            .catch(err => console.error("Error al buscar piezas:", err));
    });

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
            div.dataset.piezaId = pieza.id;
            div.innerHTML = `
                <h2>${pieza.ref_pieza}</h2>
                <p><strong>REF Pedido:</strong> ${pieza.ref_pedido}</p>
                <p><strong>Fecha:</strong> ${pieza.fecha}</p>
                <p><strong>Material:</strong> ${pieza.material} - <strong>Espesor:</strong> ${pieza.espesor} mm</p>
                <p><strong>Color:</strong> ${pieza.color}</p>
                <p><strong>Estado:</strong> ${pieza.estado}</p>
            `;
            contenedorPedidos.appendChild(div);
        });
    }

    // Delegación global para clic en pieza
    contenedorPedidos.addEventListener("click", function (e) {
        const piezaClicada = e.target.closest(".pieza");
        if (piezaClicada) {
            piezaSeleccionadaId = piezaClicada.getAttribute("data-pieza-id");
            fetch(`/pieza/${piezaSeleccionadaId}`)
                .then(res => res.json())
                .then(abrirModal)
                .catch(err => console.error(err));
        }
    });

    function abrirModal(pieza) {
        piezaSeleccionadaId = pieza.id;  // Asegura la referencia
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

        modal.style.display = "block";

        document.getElementById("guardarEstado").onclick = () => {
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
                    location.reload();
                })
                .catch(err => console.error("Error al actualizar:", err));
        };

        document.getElementById("closeModal").onclick = () => modal.style.display = "none";
    }
});
