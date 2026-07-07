(function () {
    const lat = 6.5544432;
    const lng = -73.1333276;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 16);

    let markers = new L.FeatureGroup().addTo(mapa)


    let propiedades = []

    // Filtros

    const filtros = {
        catgoria: '',
        precio: ''
    }

    const categoriasSelect = document.querySelector('#categorias')
    const preciosSelect = document.querySelector('#precios')

    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //  Filtrado de Categorias y Precios
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value
        filtrarPropiedades()
    })

    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value
        filtrarPropiedades()
    })

    const obtenerPropiedades = async () => {
        try {
            const url = '/api/propiedades'
            const respuesta = await fetch(url)
            const datos = await respuesta.json()
            propiedades = datos.propiedades

            mostrarPropiedades(datos)

            console.log(respuesta)
        } catch (error) {
            console.log(error)
        }
    }
        
    function mostrarPropiedades(data)  {

        // Limpiar los pines
        markers.clearLayers()

        const propiedades = data.propiedades
        propiedades.forEach(propiedad => {
            //Agregar los pines
            const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            }).addTo(mapa)
            .bindPopup(`
                <p class="text-indigo-600 font-bold"> ${propiedad.categoria.nombre}</p>
                <h1 class="text-xl font-extrabold uppercase my-2">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad?.titulo}">
                <p class="text-gray-600 font-bold"> ${propiedad.precio.nombre}</p>
                <a href="/propiedad/${propiedad?.id}" class="bg-indigo-600 py-2 block text-center font-bold uppercase text-white p-2 mt-2">Ver Propiedad</a>`)

            markers.addLayer(marker)
        });
    }

    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio)
        mostrarPropiedades({ propiedades: resultado })
    }

    const filtrarCategoria = (propiedad) => {
        return filtros.categoria ? propiedad.categoriaId === filtros.categoria : true
    }

    const filtrarPrecio = (propiedad) => {
        return filtros.precio ? propiedad.precioId === filtros.precio : true
    }

    obtenerPropiedades()



})()