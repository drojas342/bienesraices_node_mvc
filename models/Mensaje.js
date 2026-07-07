import { DataTypes } from "sequelize";
import db from "../config/db.js";

const Mensaje = db.define('mensajes', {
    mensaje: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    propiedadId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});


export default Mensaje;