document.addEventListener("DOMContentLoaded", function() {
    const btnToggleFiltros = document.getElementById("btnToggleFiltros");
    const filtroOpciones = document.getElementById("filtroOpciones");
    const formFiltro = document.getElementById("formFiltro");

    // Asegurar que el formulario está oculto por defecto
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
        event.preventDefault(); // Evita el envío tradicional del formulario

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

    // Función para actualizar la lista de piezas con los resultados filtrados
    function actualizarListaPiezas(piezas) {
        const listaContainer = document.querySelector('.lista-container');

        // Vaciar la lista actual de piezas
        listaContainer.innerHTML = `
            <button id="btnToggleFiltros" class="btn-filtrar">Mostrar Filtros</button>
            <h1>Resultados de la Búsqueda</h1>
        `;

        // Volver a agregar el evento al botón de filtros (se pierde al actualizar la lista)
        document.getElementById('btnToggleFiltros').addEventListener('click', toggleFiltro);

        if (piezas.length === 0) {
            listaContainer.innerHTML += "<p>No se encontraron piezas con los filtros aplicados.</p>";
            return;
        }

        // Agregar las piezas filtradas
        piezas.forEach(pieza => {
            const divPieza = document.createElement('div');
            divPieza.classList.add('pieza');
            divPieza.innerHTML = `
                <h2>${pieza.ref_pieza}</h2>
                <p><strong>REF Pedido:</strong> ${pieza.ref_pedido}</p>
                <p><strong>Fecha:</strong> ${pieza.fecha}</p>
                <p><strong>Material:</strong> ${pieza.material} - <strong>Espesor:</strong> ${pieza.espesor} mm</p>
                <p><strong>Color:</strong> ${pieza.color}</p>
                <p><strong>Estado:</strong> ${pieza.estado}</p>
            `;
            listaContainer.appendChild(divPieza);
        });
    }

    // Función para alternar el formulario de filtros después de actualizar la lista
    function toggleFiltro() {
        if (filtroOpciones.style.display === "none") {
            filtroOpciones.style.display = "flex";
            btnToggleFiltros.textContent = "Ocultar Filtros";
        } else {
            filtroOpciones.style.display = "none";
            btnToggleFiltros.textContent = "Mostrar Filtros";
        }
    }
});
