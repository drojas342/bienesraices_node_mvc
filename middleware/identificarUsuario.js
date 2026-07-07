import jwt from 'jsonwebtoken'
import { Usuario } from '../models/index.js'

const identificarUsuario = async (req, res, next) => {

    // Comprobar si hay un token

    const { _token } = req.cookies

    if (!_token) {
        req.usuario = null
        res.locals.usuario = null
        return next()
    }

    // Comprobar el token

    try {

        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)
        // Almacenar el usuario en la petición y en las vistas
        if (usuario) {
            req.usuario = usuario
            res.locals.usuario = usuario
        } else {
            req.usuario = null
            res.locals.usuario = null
        }

        return next();

    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default identificarUsuario