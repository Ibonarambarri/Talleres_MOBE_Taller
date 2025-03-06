// Código para alternar la visualización de las opciones de filtrado
const btnFiltrar = document.getElementById('btnFiltrar');
const filtroOpciones = document.getElementById('filtroOpciones');

// Ocultamos inicialmente el contenedor de filtro
filtroOpciones.style.display = 'none';

btnFiltrar.addEventListener('click', () => {
  if (filtroOpciones.style.display === 'none') {
    filtroOpciones.style.display = 'block';
  } else {
    filtroOpciones.style.display = 'none';
  }
});
