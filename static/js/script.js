document.addEventListener("DOMContentLoaded", function() {
    const btnToggleFiltros = document.getElementById("btnToggleFiltros");
    const filtroOpciones = document.getElementById("filtroOpciones");
    const formFiltro = document.getElementById("formFiltro");
    const contenedorPedidos = document.getElementById("contenedorPedidos");
    const tituloResultados = document.getElementById("tituloResultados");

    // Ocultar el formulario de filtros al inicio
    filtroOpciones.style.display = "none";

    // Alternar visibilidad del formulario de filtros
    btnToggleFiltros.addEventListener("click", function() {
        if (filtroOpciones.style.display === "none") {
            filtroOpciones.style.display = "flex";
            btnToggleFiltros.textContent = "Ocultar Filtros";
        } else {
            filtroOpciones.style.display = "none";
            btnToggleFiltros.textContent = "Mostrar Filtros";
        }
    });

    // Manejo del formulario de filtrado
    formFiltro.addEventListener("submit", function(event) {
        event.preventDefault(); // Evita que la página se recargue

        const formData = new FormData(formFiltro);
        const queryString = new URLSearchParams(formData).toString();

        console.log("🔍 Enviando solicitud a /buscar con:", queryString); // Depuración

        fetch(`/buscar?${queryString}`)
            .then(response => response.json())
            .then(data => {
                console.log("✅ Respuesta recibida:", data);
                actualizarListaPiezas(data);
            })
            .catch(error => console.error('❌ Error en la solicitud:', error));
    });

    // Función para actualizar la lista de piezas reemplazando los pedidos
    function actualizarListaPiezas(piezas) {
        contenedorPedidos.innerHTML = ""; // Limpiar la lista de pedidos

        if (piezas.length === 0) {
            tituloResultados.textContent = "No se encontraron piezas con los filtros aplicados";
            contenedorPedidos.innerHTML = "<p class='mensaje-no-resultados'>Intenta con otros criterios de búsqueda.</p>";
            return;
        }

        // Cambiar el título cuando se filtra
        tituloResultados.textContent = "Piezas que coinciden con la búsqueda";

        // Agregar cada pieza filtrada a la pantalla con mejor diseño
        piezas.forEach(pieza => {
            const divPieza = document.createElement('div');
            divPieza.classList.add('pieza');
            divPieza.innerHTML = `
                <h2 class="pieza-referencia">${pieza.ref_pieza}</h2>
                <p><strong>REF Pedido:</strong> ${pieza.ref_pedido}</p>
                <p><strong>Fecha:</strong> ${pieza.fecha}</p>
                <p><strong>Material:</strong> ${pieza.material} - <strong>Espesor:</strong> ${pieza.espesor} mm</p>
                <p><strong>Color:</strong> ${pieza.color}</p>
                <p><strong>Estado:</strong> ${pieza.estado}</p>
            `;
            contenedorPedidos.appendChild(divPieza);
        });
    }
});
