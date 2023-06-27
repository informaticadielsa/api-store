
import {  Sequelize } from 'sequelize';
import Categoria from './CategoriaModel';
import Coleccion from './ColeccionModel';
import Marca from './MarcaModel';
import SociosNegocio from './SociosNegocioModel';
import Producto from './ProductoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ElementosCupones = sequelize.define('elementos_cupones', {
    ec_elemento_cupones_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    ec_promcup_promociones_cupones_id: {
        type: Sequelize.INTEGER
    },
    ec_cat_categoria_id: {
        type: Sequelize.INTEGER
    },
    ec_mar_marca_id: {
        type: Sequelize.INTEGER
    },
    ec_sn_socios_negocio_id: {
        type: Sequelize.INTEGER
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    ec_prod_producto_id: {
        type: Sequelize.INTEGER
    }
},
{
    //Opciones
    tableName: 'elementos_cupones'
});

ElementosCupones.belongsTo(Categoria, { foreignKey: 'ec_cat_categoria_id'});
ElementosCupones.belongsTo(Marca, { foreignKey: 'ec_mar_marca_id'});
ElementosCupones.belongsTo(SociosNegocio, { foreignKey: 'ec_sn_socios_negocio_id'});
ElementosCupones.belongsTo(Producto, { foreignKey: 'ec_prod_producto_id'});
export default ElementosCupones;