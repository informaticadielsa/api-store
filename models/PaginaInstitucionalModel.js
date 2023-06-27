import {  Sequelize } from 'sequelize';
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Usuario from './UsuarioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);

const PaginaInstitucional = sequelize.define('paginas_institucionales',{
    pi_pagina_institucional_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    pi_nombre_seccion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pi_contenido_html: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pi_usu_usuario_creador_id: {
        type: Sequelize.INTEGER, 
        allowNull: false
    },
    pi_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    pi_cmm_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pi_seccion_cmm: {
        type: Sequelize.INTEGER
    }
},
{
    //Options
    tableName: 'paginas_institucionales'
});

PaginaInstitucional.belongsTo(Usuario, {
    foreignKey: 'pi_usu_usuario_creador_id',
    as: 'usuario_creador'
});

PaginaInstitucional.belongsTo(Usuario, {
    foreignKey: 'pi_usu_usuario_modificador_id',
    as: 'usuario_modificador'
});

PaginaInstitucional.belongsTo(ControlMestroMultiple, {
    foreignKey: 'pi_cmm_status_id',
    as: 'estatus'
});






export default PaginaInstitucional;