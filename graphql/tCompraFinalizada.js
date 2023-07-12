import { gql } from 'apollo-server-express';
import models from '../models';

export const typeDefs = gql`

    type Query {
        getComprasFinalizadasPorUsuario(idUsuario: Int): [CompraFinalizada]
    }

    type CompraFinalizada {
        cf_compra_finalizada_id: Int
        cf_compra_numero_orden: String
        cf_compra_fecha: DateTime
        cf_vendido_por_usu_usuario_id: Int
        createdAt: DateTime
        updatedAt: DateTime
        cf_cmm_tipo_compra_id: Int
        cf_vendido_a_socio_negocio_id: Int
        cf_cmm_tipo_envio_id: Int
        cf_direccion_envio_id: Int
        cf_cmm_tipo_impuesto: Int
        cf_alm_almacen_recoleccion: Int
        cf_total_compra: String
        cf_estatus_orden: Int
        cf_fletera_id: Int
        cf_sap_metodos_pago_codigo: String
        cf_sap_forma_pago_codigo: String
        cf_estatus_creacion_sap: Int
        cf_descripcion_sap: String
        cf_referencia: String
        cf_promcup_promociones_cupones_id: Int
        cf_orden_subtotal: String
        cf_orden_descuento: Float
        cf_orden_subtotal_aplicado: String
        cf_orden_gastos_envio: Float
        cf_order_iva: String
        cf_orden_dividida_sap: String
        cf_estatus_creacion_sap_usd: Int
        cf_descripcion_sap_usd: String
        cf_cfdi: String
        cf_mensajeov: String
        cf_mensajeov_usd: String
        cf_sap_json_creacion: String
        cf_sap_json_creacion_usd: String
        cf_sap_entregado: String
        cf_sap_entregado_usd: String
        cf_estatus_orden_usd: Int
        cf_resume_mxn: String
        cf_resume_usd: String
        cf_politica_envio_nombre: String
        cf_snu_usuario_snu_id: Int
        cf_generado_en: String
    }
`;

export const resolver = {
    Query: {
        getComprasFinalizadasPorUsuario: async (_, arg) => {
            try {
                const res = await models.CompraFinalizada.findAll();
                console.log('res ', res);
                return res;
            } catch (error) {
                console.log(error);
                return error;
            }
        }
    },
};