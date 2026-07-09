import { validationResult } from "express-validator";
import { Precio, Categoria, Propiedad, Mensaje, Usuario } from "../models/index.js";
import { unlink } from "node:fs/promises";
import { vendedor, formatoFecha } from "../helpers/index.js";


const admin = async (req, res) => {
    //Leer query String

    const { pagina: paginaActual } = req.query;

    const expresioRegular = /^[1-9]$/; //Para validar que la pagina sea un número

    if (!expresioRegular.test(paginaActual)) {
        return res.redirect("/mis-propiedades?pagina=1");
    }

    try {
        const { id } = req.usuario;

        //Limites para y Offset para el paginador
        const limit = 10;
        const offset = ((paginaActual * limit) - limit);

        const [propiedades, total] = await Promise.all([
            await Propiedad.findAll({
                limit: limit,
                offset: offset,
                where: {
                    usuarioId: id,
                },
                include: [
                    { model: Categoria, as: "categoria" },
                    { model: Precio, as: "precio" },
                    { model: Mensaje, as: "mensajes" }
                ],
            }),
            Propiedad.count({
                where: {
                    usuarioId: id,
                },
            })
        ])

        res.render("propiedades/admin", {
            pagina: "Mis Propiedades",
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit), //Calcular el total de paginas
            paginaActual: Number(paginaActual), //Si no hay pagina actual, se asigna 1
            total,
            ocultar: true,
            offset,
            limit,
        });
    } catch (error) {
        console.log("Error al obtener las propiedades:", error);
    }
};

// Formulario para crear una propiedad
const crear = async (req, res) => {
    //Consultar modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ]);

    res.render("propiedades/crear", {
        pagina: "Crear Propiedad",
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {},
    });
};

const guardar = async (req, res) => {
    //Resultdo validación
    let resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        //Consultar modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ]);

        return res.render("propiedades/crear", {
            pagina: "Crear Propiedad",
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body,
        });
    }

    //Crear Registro

    const {
        titulo,
        descripcion,
        habitaciones,
        estacionamientos,
        wc,
        calle,
        lat,
        lng,
        precio: precioId,
        categoria: categoriaId,
    } = req.body;

    const { id: usuarioId } = req.usuario;

    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: "",
        });

        //Imprimir el id de la propiedad guardada

        const { id } = propiedadGuardada;

        res.redirect(`/propiedades/agregar-imagen/${id}`);
    } catch (error) {
        console.log(error);
    }
};

const agregarImagen = async (req, res) => {
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    console.log("ID recibido:", id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //Validar que la propiedad no este  publicada
    if (propiedad.publicado) {
        return res.redirect("/mis-propiedades");
    }

    //Validar que el usuario sea el propietario de la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    res.render("propiedades/agregar-imagen", {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad,
    });
};

const almacenarImagen = async (req, res, next) => {
    //Extraer el id de la propiedad
    //Imprimir toda la información req.params
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);
    if (!propiedad) {
        console.log("Propiedad no encontrada");
        return res.redirect("/mis-propiedades");
    }

    //Validar que la propiedad no este  publicada
    if (propiedad.publicado) {
        console.log("Propiedad ya publicada");
        return res.redirect("/mis-propiedades");
    }

    //Validar que el usuario sea el propietario de la propiedad
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        console.log("No tienes permiso para agregar imagen");
        return res.redirect("/mis-propiedades");
    }

    try {
        //Alamacenar la imagen y publicar la propiedad
        propiedad.imagen = req.file.filename;
        propiedad.publicado = 1;

        await propiedad.save();

        next();
    } catch (error) {
        console.log("Error al almacenar la imagen:", error);
    }
};

const editar = async (req, res) => {
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //Revisar que quien edita sea el propietario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //Consultar modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll(),
    ]);

    res.render("propiedades/editar", {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad,
    });
};

const guardarCambios = async (req, res) => {
    //Imprimir el objeto req.body
    console.log("Datos recibidos:", req.body);

    //Verificar errores de validación
    let resultado = validationResult(req);

    console.log("Resultado de la validación:", resultado);

    if (!resultado.isEmpty()) {
        //Consultar modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll(),
        ]);

        const {
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precio: precioId,
            categoria: categoriaId,
        } = req.body;

        //Crear un objeto con los datos del formulario
        const datos = {
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
        };

        //Si hay errores, volver a renderizar el formulario
        return res.render("propiedades/editar", {
            pagina: "Editar Propiedad",
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos,
        });
    }

    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //Revisar que quien edita sea el propietario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //Reescribir el objetos

    try {
        const {
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precio: precioId,
            categoria: categoriaId,
        } = req.body;

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamientos,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
        });

        await propiedad.save();

        res.redirect("/mis-propiedades");
    } catch (error) {
        console.log("Error al guardar los cambios:", error);
    }
};

const eliminar = async (req, res) => {
    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //Revisar que quien edita sea el propietario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    //Eliminar la imagen del servidor
    await unlink(`public/uploads/${propiedad.imagen}`);

    //Eliminar la propiedad
    await propiedad.destroy();
    res.redirect("/mis-propiedades");
};

// Modificar el estado de la propiedad
const cambiarEstado = async (req, res) => {

    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id);

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //Revisar que quien edita sea el propietario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    // Actualizar el estado de la propiedad en la db

    propiedad.publicado = !propiedad.publicado;

    await propiedad.save();
    
     

    await propiedad.save();
    res.json({
        resultado: true
    })


}

const mostrarPropiedad = async (req, res) => {
    const { id } = req.params;

    //Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: "categoria" },
            { model: Precio, as: "precio" },
        ],
    });

    if (!propiedad || !propiedad.publicado) {
        return res.redirect("/404");
    }

    res.render("propiedades/mostrar", {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        vendedor: vendedor(req.usuario?.id, propiedad.usuarioId)
    });
};

const enviarMensaje = async (req, res) => {
    const { id } = req.params;

    //Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Categoria, as: "categoria" },
            { model: Precio, as: "precio" },
        ],
    });

    if (!propiedad) {
        return res.redirect("/404");
    }

    // Validar errores

    const resultado = validationResult(req);

    if (!resultado.isEmpty()) {
        return res.render("propiedades/mostrar", {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            vendedor: vendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        });

    }

    // Almacenar el mensaje

    const { mensaje } = req.body;
    const { id: propiedadId } = req.params;
    const { id: usuarioId } = req.usuario;


    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    });



    res.render("propiedades/mostrar", {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        vendedor: vendedor(req.usuario?.id, propiedad.usuarioId),
        enviado: true
    });
}

// Leer mensajes recibidos

const verMensajes = async (req, res) => {

    const { id } = req.params;

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            {
                model: Mensaje, as: "mensajes",
                include: [
                    {model: Usuario.scope("eliminarPassword"), as : "usuario"}
                ]
            }
        ]
    });

    if (!propiedad) {
        return res.redirect("/mis-propiedades");
    }

    //Revisar que quien edita sea el propietario
    if (propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect("/mis-propiedades");
    }

    res.render("propiedades/mensajes", {
        pagina: "Mensajes",
        mensajes: propiedad.mensajes,
        formatearFecha: formatoFecha
    })

}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes
};
