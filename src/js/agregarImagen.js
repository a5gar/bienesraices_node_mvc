import { Dropzone } from 'dropzone';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

Dropzone.options.imagen = {
    dictDefaultMessage: 'Sube aqui tus imágenes!',
    acceptedFiles: '.png, .jpg, .jpeg',
    maxFilesize: 5,
    maxFiles: 1,
    parallelUploads: 1,
    autoProcessQueue: false,
    addRemoveLinks: true,
    dictRemoveFile: 'Eliminar',
    dictMaxFilesExceeded: 'El Limite es 1 Archivo',
    headers: {
        'CSRF-Token': token
    },
    paramName: 'imagen',
    init: function() {
        const dropzone = this
        const btnPublicar = document.querySelector('#publicar')
        btnPublicar.addEventListener('click', function() {
            dropzone.processQueue();
        });

        dropzone.on('queuecomplete', function() {
            window.location.href = '/mis-propiedades'
        });
    }

}