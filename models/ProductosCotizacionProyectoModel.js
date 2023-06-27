import { Sequelize } from 'sequelize';
import Producto from './ProductoModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const ProductoCotizacionProyecto = sequelize.define('producto_cotizaciones',
{
    pc_producto_cotizacion_id: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        primaryKey: true, 
        autoIncrement: true
    },
    pc_cot_cotizacion_id: {
        type: Sequelize.INTEGER, 
        allowNull: false
    },
    pc_prod_producto_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    pc_cantidad_producto: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    pc_mejor_descuento: {
        type: Sequelize.INTEGER
    },
    pc_precio:{
        type: Sequelize.DECIMAL(10,2),
        field: 'pc_precio'
    }
},
{
    //Options
    tableName: 'productos_cotizaciones'
});

ProductoCotizacionProyecto.belongsTo(Producto,{
    foreignKey: 'pc_prod_producto_id',
    targetKey: 'prod_producto_id'
});
export default ProductoCotizacionProyecto;