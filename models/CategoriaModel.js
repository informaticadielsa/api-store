import {  Sequelize } from 'sequelize';
import Atributo from './AtributoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
const Categoria = sequelize.define('categoria', {
    cat_categoria_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cat_nombre:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    cat_descripcion:{
        type: Sequelize.STRING,
        allowNull: false
    },
    cat_meta_titulo:{
        type: Sequelize.STRING,
    },
    cat_meta_descripcion:{
        type: Sequelize.STRING,
    },
    cat_usu_usuario_creador_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    cat_cmm_estatus_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    cat_usu_usuario_modificador_id: {
        type: Sequelize.INTEGER
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    cat_cat_categoria_padre_id:{
        type: Sequelize.INTEGER
    },
    cat_nombre_tienda:{
        type: Sequelize.STRING,
    },
    cat_categoria_link:{
        type: Sequelize.STRING,
    },
    cat_img_link:{
        type: Sequelize.STRING,
    }

},
{ 
    //Options
    tableName: 'categorias'
}
);

Categoria.belongsTo(ControlMestroMultiple, {
    foreignKey: 'cat_cmm_estatus_id'
});
  
Categoria.belongsTo(Categoria, {
    foreignKey: 'cat_cat_categoria_padre_id'
});

//Comentado por henry, el campo ya no existe.
// Categoria.hasMany(Atributo, { 
//     foreignKey: 'at_cat_categoria_id' 
// });
export default Categoria;