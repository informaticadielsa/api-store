
import {  Sequelize } from 'sequelize';
import Categoria from './CategoriaModel';
import Coleccion from './ColeccionModel';
import Marca from './MarcaModel';
import SociosNegocio from './SociosNegocioModel';
import Producto from './ProductoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ElementoPromocion = sequelize.define('elemento_promocion', {
    ep_elemento_promocion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    ep_promdes_promocion_descuento_id: {
        type: Sequelize.INTEGER
    },
    ep_cat_categoria_id: {
        type: Sequelize.INTEGER
    },
    ep_mar_marca_id: {
        type: Sequelize.INTEGER
    },
    ep_col_coleleccion_id: {
        type: Sequelize.INTEGER
    },
    ep_sn_socios_negocio_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    ep_prod_producto_id: {
        type: Sequelize.INTEGER
    }
},
{
    //Opciones
    tableName: 'elementos_promocion'
});

ElementoPromocion.belongsTo(Categoria, { foreignKey: 'ep_cat_categoria_id'});
ElementoPromocion.belongsTo(Marca, { foreignKey: 'ep_mar_marca_id'});
ElementoPromocion.belongsTo(Coleccion, { foreignKey: 'ep_col_coleleccion_id'});
ElementoPromocion.belongsTo(SociosNegocio, { foreignKey: 'ep_sn_socios_negocio_id'});
ElementoPromocion.belongsTo(Producto, { foreignKey: 'ep_prod_producto_id'});
export default ElementoPromocion;