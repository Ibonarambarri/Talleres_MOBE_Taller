document.addEventListener("DOMContentLoaded", function () {
    const btnToggleFiltros = document.getElementById("btnToggleFiltros");
    const filtroOpciones = document.getElementById("filtroOpciones");
    const formFiltro = document.getElementById("formFiltro");
    const contenedorPedidos = document.getElementById("contenedorPedidos");
    const tituloResultados = document.getElementById("tituloResultados");

    // Mostrar/ocultar filtros
    btnToggleFiltros.addEventListener("click", function(){
        if(filtroOpciones.style.display === "none"){
            filtroOpciones.style.display = "flex";
            btnToggleFiltros.textContent = "Ocultar Filtros";
        } else {
            filtroOpciones.style.display = "none";
            btnToggleFiltros.textContent = "Mostrar Filtros";
        }
    });

    // Filtrar piezas
    formFiltro.addEventListener("submit", function(e){
        e.preventDefault();
        const queryString = new URLSearchParams(new FormData(formFiltro)).toString();
        fetch(`/buscar?${queryString}`)
            .then(res => res.json())
            .then(actualizarListaPiezas)
            .catch(err => console.error(err));
    });

    // Actualiza piezas filtradas
    function actualizarListaPiezas(piezas){
        contenedorPedidos.innerHTML = "";
        if(!piezas.length){
            tituloResultados.textContent = "No se encontraron piezas";
            contenedorPedidos.innerHTML = "<p>No hay resultados para esta búsqueda.</p>";
            return;
        }
        tituloResultados.textContent = "Piezas que coinciden con la búsqueda";

        piezas.forEach(pieza => {
            const div = document.createElement("div");
            div.classList.add("pieza");
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

    // Evento global clic en pieza (redirigir a página de detalle)
    contenedorPedidos.addEventListener("click", function(e){
        const piezaDiv = e.target.closest(".pieza");
        if(piezaDiv){
            const piezaId = piezaDiv.dataset.piezaId;
            window.location.href = `/pieza/${piezaId}/detalle`;
        }
    });
});
