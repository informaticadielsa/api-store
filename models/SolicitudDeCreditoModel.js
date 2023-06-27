import {  Sequelize } from 'sequelize';
import ArchivosDeInicio from './ArchivosDeInicioModel';
const sequelize = new Sequelize(process.env.POSTGRESQL);
import ControlMestroMultiple from './ControlMaestroMultipleModel';
import Estado from './EstadoModel';
import Pais from './PaisModel';
import SociosNegocio from './SociosNegocioModel';
import SucursalSolicitudDeCredito from './SucursalSolicitudDeCreditoModel';
import VehiculoSolicitudDeCredito from './VehiculoSolicitudDeCreditoModel';
const SolicitudDeCredito = sequelize.define('solicitud_de_credito',{
    sdc_solicitud_de_credito_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    sdc_nombre_razon_social: {
        type: Sequelize.STRING,
    },
    sdc_rfc: {
        type: Sequelize.STRING,
    },
    sdc_sito_web: {
        type: Sequelize.STRING,
    },
    sdc_giro_empresa: {
        type: Sequelize.STRING,
    },
    sdc_tipo_informa: {
        type: Sequelize.STRING,
    },
    sdc_quien_informa: {
        type: Sequelize.STRING,
    },
    sdc_antiguedad_puesto: {
        type: Sequelize.STRING,
    },
    sdc_codigo_postal: {
        type: Sequelize.STRING,
    },
    sdc_calle: {
        type: Sequelize.STRING,
    },
    sdc_numero: {
        type: Sequelize.STRING,
    },
    sdc_colonia: {
        type: Sequelize.STRING,
    },
    sdc_municipio_delegacion: {
        type: Sequelize.STRING,
    },
    sdc_pais: {
        type: Sequelize.INTEGER,
    },
    sdc_estado: {
        type: Sequelize.INTEGER,
    },
    sdc_pagos_telefono: {
        type: Sequelize.STRING,
    },
    sdc_pagos_contacto: {
        type: Sequelize.STRING,
    },
    sdc_pagos_correo_electronico: {
        type: Sequelize.STRING,
    },
    sdc_contabilidad_telefono: {
        type: Sequelize.STRING,
    },
    sdc_contabilidad_contacto: {
        type: Sequelize.STRING,
    },
    sdc_contabilidad_correo_electronico: {
        type: Sequelize.STRING,
    },
    sdc_direccion_general_telefono: {
        type: Sequelize.STRING,
    },
    sdc_direccion_general_contacto: {
        type: Sequelize.STRING,
    },
    sdc_direccion_general_correo_electronico: {
        type: Sequelize.STRING,
    },
    sdc_facturacion_telefono: {
        type: Sequelize.STRING,
    },
    sdc_facturacion_contacto: {
        type: Sequelize.STRING,
    },
    sdc_facturacion_correo_electronico: {
        type: Sequelize.STRING,
    },
    sdc_tipo_empresa: {
        type: Sequelize.STRING,
    },
    sdc_tiene_sucursales: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    sdc_pertenece_grupo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    sdc_grupo_pertenece: {
        type: Sequelize.STRING,
    },
    sdc_antiguedad_empresa: {
        type: Sequelize.STRING,
    },
    sdc_fecha_inicio_operacion: {
        type: Sequelize.STRING,
    },
    sdc_capital_fijo: {
        type: Sequelize.STRING,
    },
    sdc_capital_variable: {
        type: Sequelize.STRING,
    },
    sdc_dimension_frente: {
        type: Sequelize.STRING,
    },
    sdc_dimension_fondo: {
        type: Sequelize.STRING,
    },
    sdc_dimension_superficie: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_codigo_postal: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_calle: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_numero: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_colonia: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_municipio: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_estado: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_telefono: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_correo_electronico: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_tipo_domicilio: {
        type: Sequelize.STRING,
    },
    sdc_apoderado_legal_renta: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_tipo: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_especifica: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_territorio_influencia: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_volumen_compra: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_promedio_ventas_mensuales: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_promedio_ventas_anuales: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_utilidades_anio_previo: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_utilidades_anio_presente: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_tipo_moneda: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_moneda_facturar: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_empleados_laborando: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_pagos_fijos_mensuales: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_tipo_local: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_monto_renta_local_mensual: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_limite_de_credito_deseado: {
        type: Sequelize.STRING,
    },
    sdc_rama_empresa_plazo_credito: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_uno_nombre: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_uno_monto: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_uno_antiguedad: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_uno_plazo: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_uno_telefonos: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_dos_nombre: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_dos_monto: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_dos_antiguedad: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_dos_plazo: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_dos_telefonos: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_tres_nombre: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_tres_monto: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_tres_antiguedad: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_tres_plazo: {
        type: Sequelize.STRING,
    },
    sdc_referencia_comercial_tres_telefonos: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_uno_banco: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_uno_no_cuenta: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_uno_sucursal: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_uno_ejecutivo_cuenta: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_uno_telefonos: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_dos_banco: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_dos_no_cuenta: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_dos_sucursal: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_dos_ejecutivo_cuenta: {
        type: Sequelize.STRING,
    },
    sdc_referencia_bancaria_dos_telefonos: {
        type: Sequelize.STRING,
    },
    sdc_recoleccion_de_mercancia_uno: {
        type: Sequelize.STRING,
    },
    sdc_recoleccion_de_mercancia_dos: {
        type: Sequelize.STRING,
    },
    sdc_recoleccion_de_mercancia_tres: {
        type: Sequelize.STRING,
    },
    sdc_vehiculos: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    sdc_status_cmm_control_id: {
        type: Sequelize.STRING,
    },
    sdc_sn_socio_de_negocio_id: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type:   Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    sdc_nombre_quien_informa: {
        type: Sequelize.STRING
    },
    sdc_cantidad_vehiuculo: {
        type: Sequelize.STRING
    }
},
{
    //Options
    tableName: 'solicitudes_de_credito'
});

SolicitudDeCredito.belongsTo(ControlMestroMultiple, {
    foreignKey: 'sdc_status_cmm_control_id',
    as: 'estatus_solicitud'
});

SolicitudDeCredito.belongsTo(SociosNegocio, {
    foreignKey: 'sdc_sn_socio_de_negocio_id',
    as: 'socio_negocio'
});

SolicitudDeCredito.hasMany(VehiculoSolicitudDeCredito, {
    foreignKey: 'vsdc_sdc_solicitud_de_credito_id',
    as: 'vehiculos'
});

SolicitudDeCredito.hasMany(SucursalSolicitudDeCredito, {
    foreignKey: 'ssdc_solicitud_de_credito_id',
    as: 'sucursales'
});

SolicitudDeCredito.belongsTo(Pais, {
    foreignKey: 'sdc_pais',
    as: 'pais'
});

SolicitudDeCredito.belongsTo(Estado, {
    foreignKey: 'sdc_estado',
    as: 'estado'
});

SolicitudDeCredito.hasOne(ArchivosDeInicio, {
    foreignKey: 'adi_sdc_solicitud_de_credito_id',
    as: 'anexos'
});
export default SolicitudDeCredito;