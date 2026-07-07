import { check, validationResult } from 'express-validator'

import Usuario from "../models/Usuario.js"
import { generarJWT, generarId } from "../helpers/tokens.js"
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'
import bcrypt from 'bcrypt'
import e from 'express'


const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken() // Añadir el token CSRF al formulario
    });
}

const autenticar = async (req, res) => {
    //Validación  
    await check('email').isEmail().withMessage("El Email es Obligatorio").run(req);
    await check('password').notEmpty().withMessage("El password es Obligatorio").run(req)

    let resultado = validationResult(req)

    //Verificar que resultado este vacío
    if (!resultado.isEmpty()) {
        // Errores
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });

    }

    //Comprobar si el usuario existe
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no existe' }]
        });
    }

    //Comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no esta confirmado' }]
        });
    }

    //Comprobar el password
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El password es incorrecto' }]
        });
    }

    //Autenticar al usuario
    const token = generarJWT(usuario.id);

    return res.cookie('_token', token, {
        httpOnly: true,
        path: '/',
    }).redirect('/mis-propiedades'); // Redirigir  
}

const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login');
}

const formularioRegistro = (req, res) => {

    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken() // Añadir el token CSRF al formulario
    });
}

const registrar = async (req, res) => {

    //Validación 

    await check('nombre').notEmpty().withMessage("El nombre no puede ir vacío").run(req);
    await check('email').isEmail().withMessage("Eso no parece un email").run(req);
    await check('password').isLength({ min: 6 }).withMessage("El password debe de se de al menos 6 caracteres").run(req)
    await check('repetir_password').equals(req.body.password).withMessage("Las contraseñas no coinciden").run(req)


    let resultado = validationResult(req)

    //Verificar que resultado este vacío

    if (!resultado.isEmpty()) {

        // Errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }

        });

    }

    const { nombre, email, password } = req.body

    // Verificar que el usuario no este duplicado

    const existeUsuario = await Usuario.findOne({ where: { email } })

    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario ya esta registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        });
    }

    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //Envia email de confirmación

    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


    //Mostrar mensaje de confirmación

    res.render('template/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un Email de Confirmación, presiona en el enlace'
    })


}

//Función que comprueba cuenta de usuario
const confirmar = async (req, res) => {
    const { token } = req.params;

    //Verificar si el token es válido

    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        });
    }


    //Confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta Confirmada',
        mensaje: 'La cuenta ha sido confirmada correctamente',
    });
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        csrfToken: req.csrfToken(),
        pagina: 'Recupera tu acceso a Bienes Raíces',
    });
}

const resetPassword = async (req, res) => {

    //Validación 

    await check('email').isEmail().withMessage("Eso no parece un email").run(req);


    let resultado = validationResult(req)

    //Verificar que resultado este vacío

    if (!resultado.isEmpty()) {

        // Errores
        return res.render('auth/olvide-password', {
            csrfToken: req.csrfToken(),
            pagina: 'Recupera tu acceso a Bienes Raíces',
            errores: resultado.array(),
        });

    }

    //Buscar el usuario por email
    const { email } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
        return res.render('auth/olvide-password', {
            csrfToken: req.csrfToken(),
            pagina: 'Recupera tu acceso a Bienes Raíces',
            errores: [{ msg: 'El usuario no existe' }],
        });
    }

    //Generar un token y enviar email
    usuario.token = generarId();
    await usuario.save();

    //Enviar email
    emailOlvidePassword({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    });

    //Renderizar mensaje de confirmación
    res.render('template/mensaje', {
        pagina: 'Reestablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones para reestablecer tu password'
    });


}

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: { token } });

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu Password',
            mensaje: 'Hubo un error al validar tu información, intenta de nuevo',
            error: true
        });
    }

    //Mostrar formulario para nuevo password
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu Password',
        csrfToken: req.csrfToken(),
    });
}

const nuevoPassword = async (req, res) => {

    //Validar el password
    await check('password').isLength({ min: 6 }).withMessage("El password debe de se de al menos 6 caracteres").run(req)

    let resultado = validationResult(req)

    //Verificar que resultado este vacío
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        });
    }

    const { token } = req.params;
    const { password } = req.body;

    //Identificar al usuario que esta reseteando el password
    const usuario = await Usuario.findOne({ where: { token } });

    //Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);

    usuario.token = null; //Limpiar el token
    await usuario.save(); //Guardar el nuevo password

    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El password se ha reestablecido correctamente, ya puedes iniciar sesión',
    });


}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    formularioOlvidePassword,
    confirmar,
    registrar,
    resetPassword,
    comprobarToken,
    nuevoPassword
}