import {  Dropzone } from 'dropzone'; 

const token = document.querySelector('meta[name="csrf-token"]')
.getAttribute('content');

Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube tus imágenes aquí',
    acceptedFiles: '.png, .jpg, .jpeg, .gif',
    maxFilesize: 50, // MB
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false, // Evita que se suba automáticamente
    addRemoveLinks: true, // Permite eliminar la imagen
    dictRemoveFile: 'Borrar Imagen',
    dictMaxFilesExceeded: 'No puedes subir más de una imagen',
    headers :{
        'CSRF-Token': token,
    },
    paramName: 'imagen',
    init: function() {
        const dropzone = this;
        const publicarBtn = document.querySelector('#publicar');

        publicarBtn.addEventListener('click', function() {
            dropzone.processQueue()
        })

        dropzone.on('queuecomplete', function( ) {
            if (dropzone.getActiveFiles().length == 0  ) {
                window.location.href = '/mis-propiedades';
            }
        })
    }
}