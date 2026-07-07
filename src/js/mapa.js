(function() {
    //Logical Or
    const lat = document.querySelector('#lat').value || 6.5544432;
    const lng = document.querySelector('#lng').value || -73.1333276;
    const mapa = L.map('mapa').setView([lat, lng ], 16);
    let marker;

    //Utilizar Provider y Geocoder
    const geocoderService = L.esri.Geocoding.geocodeService();
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El pin
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    }).addTo(mapa);

    //Detectar el movimiento del pin
    marker.on('moveend', function(e) {  
        marker = e.target
        const position = marker.getLatLng();
        mapa.panTo(new L.LatLng(position.lat, position.lng))

        //Obtener la información al soltar el pin
        geocoderService.reverse().latlng(position, 16).run(function(error, resultado) {
            marker.bindPopup(resultado.address.LongLabel).openPopup();
            
            //LLenar los campos de dirección
            document.querySelector('.calle').textContent = resultado?.address?.Address ?? '';
            document.querySelector('#calle').value = resultado?.address?.Address ?? '';
            document.querySelector('#lat').value = resultado?.latlng?.lat ?? '';
            document.querySelector('#lng').value = resultado?.latlng?.lng ?? '';
        })
    })


})()