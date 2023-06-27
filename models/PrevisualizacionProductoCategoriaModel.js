import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import Categoria from './CategoriaModel';
const PrevisualizacionProductoCategoria = sequelize.define('previsualizacion_producto_categoria', { 
    ppc_previsualizacion_producto_categoria_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    ppc_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ppc_cat_categoria_id:{
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW 
    },
    updatedAt:{
        type: Sequelize.DATE
    }
},{
    //options
    tableName: 'previsualizacion_productos_categorias'
});

PrevisualizacionProductoCategoria.belongsTo(Categoria,{
    foreignKey: 'ppc_cat_categoria_id'
});
export default PrevisualizacionProductoCategoria;