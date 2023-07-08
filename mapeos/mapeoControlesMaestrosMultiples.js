const ControlMestroMultiple = ({
    ESTATUS_USUARIO:{
        ACTIVO      :   1000001,
        INACTIVO    :   1000002,
        ELIMINADO   :   1000003
    },
    ESTATUS_MENU:{
        ACTIVO      :   1000004,
        INACTIVO    :   1000005,
        ELIMINADO   :   1000006
    },
    ESTATUS_ROL:{
        ACTIVO      :   1000007,
        INACTIVO    :   1000008,
        ELIMINADO   :   1000009
    },
    ESTATUS_CATEGORIA: {
        ACTIVO      :   1000010,
        INACTIVO    :   1000011,
        ELIMINADO   :   1000012
    },
    ESTATUS_ATRIBUTO: {
        ACTIVO      :   1000013,
        INACTIVO    :   1000014,
        ELIMINADO   :   1000015
    },
    ESTATUS_PRODUCTO: {
        ACTIVO      :   1000016,
        INACTIVO    :   1000017,
        ELIMINADO   :   1000018
    },
    ESTATUS_EQUIPO_DE_TRABAJO: {
        ACTIVO      :   1000019,
        INACTIVO    :   1000020,
        ELIMINADO   :   1000021
    },
    ESTATUS_USUARIO_EQUIPO_TRABAJO: {
        ACTIVO      :   1000022,
        INACTIVO    :   1000023,
        ELIMINADO   :   1000024
    },
    ESTATUS_META_EQUIPO: {
        ACTIVO      :   1000025,
        INACTIVO    :   1000026,
        ELIMINADO   :   1000027
    },
    ESTATUS_META_USUARIO: {
        'ACTIVO'          :   1000028,
        'INACTIVA'        :   1000029,
        'ELIMINADA'       :   1000030,
        'COMPLETADA'      :   1000031,
        'NO COMPLETADA'   :   1000032
    },
    ESTATUS_COLECCION: {
        ACTIVA      :   1000033,
        INACTIVA    :   1000034,
        ELIMINADA   :   1000035
    },
    ESTATUS_ALMACENES: {
        ACTIVA      :   1000036,
        INACTIVA    :   1000037,
        ELIMINADA   :   1000038
    },
    ESTATUS_LISTA_DE_PRECIO: {
        ACTIVO      :   1000039,
        INACTIVA    :   1000040,
        ELIMINADA   :   1000041
    },
    ESTATUS_MARCAS: {
        ACTIVA      :   1000042,
        INACTIVA    :   1000043,
        ELIMINADA   :   1000044
    },
    ESTATUS_SOCIOS_NEGOCIO: {
        ACTIVA      :   1000045,
        INACTIVA    :   1000046,
        ELIMINADA   :   1000047,
        PENDIENTE   :   1000086
    },
    ESTATUS_SOCIOS_NEGOCIO_USUARIO: {
        ACTIVA      :   1000048,
        INACTIVA    :   1000049,
        ELIMINADA   :   1000050
    },
    ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES: {
        ACTIVA      :   1000051,
        INACTIVA    :   1000052,
        ELIMINADA   :   1000053
    },
    TIPO_ALMACEN:{
        VIRTUAL     :   1000057,
        FISICO      :   1000058
    },  
    TIPO_ROL_MENU: {
        ADMINISTRADOR       :   1000054,
        SOCIO_DE_NEGOCIO    :   1000055,
        VENDEDORES          :   1000056,
        GERENTES            :   1000202,
    },
    ESTATUS_PROMOCION: {
        ACTIVA      :   1000059,
        INACTIVA    :   1000060,
        ELIMINADA   :   1000061
    },
    TIPO_PROMOCION: {
        'Monto fijo'    :   1000062,
        Porcentaje      :   1000063,
        Regalo          :   1000064,
        'Envío Gratis'  :   1000065,
        '2 X 1'         :   1000066,
        '3 X 2'         :   1000157
    },
    TIPO_COTIZACION_PROYECTO: {
        COTIZACION      : 1000076,
        PROYECTO        : 1000077
    },
    ESTATUS_COTIZACION_PROYECTO: {
        ACTIVO          :   1000078,
        INACTIVA        :   1000079,
        ELIMINADA       :   1000080,
        CANCELADA       :   1000099,
        FINALIZADA      :   1000100
    },
    ESTUS_PRODUCTO_COTIZACION: {
        APROBADO        :   1000081,
        PENDIENTE       :   1000082,
        DECLINADO       :   1000083
    },
    ROLES_VENDEDORES: {
        admin: 'Gerente',
        vendedor: 'Vendedor'
    },
    ROLES_ADMIN: {
        admin: 'Administrador'
    },
    ROLES_SOCIO_NEGOCIO : {
        admin: 'Administrador'
    },
    TIPO_IMPUESTO: {
        '8%'            :   1000084,
        '16%'           :   1000085
    },
    ATRIBUTO_PRODUCTO: {
        ACTIVO          :   1000087,
        INACTIVA        :   1000088,
        ELIMINADA       :   1000089
    },
    ATRIBUTO_SKU_VALOR: {
        ACTIVO          :   1000090,
        INACTIVA        :   1000091,
        ELIMINADA       :   1000092
    },
    ATRIBUTO_CATEGORIAS: {
        ACTIVO          :   1000093,
        INACTIVA        :   1000094,
        ELIMINADA       :   1000095
    },
    ATRIBUTO_PRODUCTOS_VALOR: {
        ACTIVO          :   1000096,
        INACTIVA        :   1000097,
        ELIMINADA       :   1000098
    },
    ESTATUS_FLETERA: {
        ACTIVO          :   1000104,
        INACTIVA        :   1000105,
        ELIMINADA       :   1000106
    },
    ESTATUS_STATUS_ORDEN_FINALIZADA: {
            PENDIENTE                   :   1000107,
            Cancelado                   :   1000108,
            ABIERTA                     :   1000109,
            CERRADA                     :   1000110,
            "ELECCION PENDIENTE"        :   1000111,
            APROBADA                    :   1000112,
            RECHAZADA                   :   1000113,
            "REPLICA PENDIENTE"         :   1000114,
            "REPLICA ERROR"             :   1000115,
            "AUTORIZACION PENDIENTE"    :   1000116,
            "En Proceso"                :   1000184,
            "Pendiente de confirmar"    :   1000185,
            "Entregado"                 :   1000186,
            "En Tránsito"                 :   1000187,
    },
    SAP_METODOS_PAGO: {
        ACTIVO          :   1000118,
        INACTIVA        :   1000119,
        ELIMINADA       :   1000120
    },
    SAP_FORMAS_PAGO: {
        ACTIVO          :   1000121,
        INACTIVA        :   1000122,
        ELIMINADA       :   1000123
    },
    KIT_STATUS: {
        ACTIVO          :   1000124,
        INACTIVA        :   1000125,
        ELIMINADA       :   1000126
    },
    FAQS_STATUS: {
        ACTIVO          :   1000127,
        INACTIVA        :   1000128,
        ELIMINADA       :   1000129
    },
    ESTATUS_BANNERS: {
        ACTIVO          :   1000130,
        INACTIVA        :   1000131,
        ELIMINADA       :   1000132
    },
    ESTATUS_SLIDERS: {
        ACTIVO          :   1000133,
        INACTIVA        :   1000134,
        ELIMINADA       :   1000135
    },
    ESTATUS_PROVEEDORES: {
        ACTIVO          :   1000136,
        INACTIVA        :   1000137,
        ELIMINADA       :   1000138
    },
    ESTATUS_ARCHIVO_MAIN: {
        ACTIVO          :   1000141,
        INACTIVO        :   1000142,
        ELIMINADO       :   1000143
    },
    TIPO_ARCHIVO_MAIN: {
        MAIN_SLIDER                 :   1000144,
        MAIN_BANNER_TOP             :   1000145,
        MAIN_BANNER_BOTTOM          :   1000146,
        MAIN_ICONS                  :   1000147,
        SECONDARY_BANNERS_TOP       :   1000148,
        SECONDARY_BANNERS_BOTTOM    :   1000149,
        LOGO_HOME                   :   1000150,
        BRANDS_BANNER               :   1000193,
        CLIENTS_BANNER              :   1000194,
        MAIN_SLIDER_MOVIL           :   1000203
    },
    ESTATUS_WISH_LIST: {
        ACTIVO          :   1000161,
        INACTIVO        :   1000162,
        ELIMINADO       :   1000163
    },
    ALMACEN_PICKUP: {
        DISPONIBLE          :   1000139,
        "NO DISPONIBLE"     :   1000140
    },
    STATUS_PAGINA_INSTITUCIONAL: {
        ACTIVA          :   1000151,
        INACTIVA        :   1000152,
        ELIMINADA       :   1000153
    },
    TIPO_COLECCION: {
        RELACIONADO     :   1000156,
        DESTACADO       :   1000155,
        CARRUCEL        :   1000154,
    },
    STATUS_SOLICITUD_CREDITO: {
        INCOMPLETA      :   1000160,
        PENDIENTE       :   1000159,
        APROBADA        :   1000158
    },
    TIPO_ARCHIVO: {
        SOLICITUD_DE_CREDITO    : 1000164
    },
    ESTATUS_ARCHIVOS: {
        ACTIVO          :   1000165,
        INACTIVO        :   1000166
    },
    ESTATUS_CUPONES: {
        ACTIVO      :   1000169,
        INACTIVA    :   1000170,
        ELIMINADA   :   1000171
    },
    ESTATUS_POLITICA_ENVIO: {
        ACTIVO      :   1000172,
        INACTIVA    :   1000173,
        ELIMINADA   :   1000174
    },
    ESTATUS_SOCIOS_NEGOCIO_DESCUENTOS: {
        ACTIVO      :   1000175,
        INACTIVA    :   1000176
    },
    ESTATUS_COTIZACION: {
        ACTIVO      :   1000177,
        INACTIVA    :   1000178,
        ELIMINADA   :   1000179,
        CANCELADA   :   1000180,
        
        NUEVA       :   1000195,
        DECLINADA   :   1000196,
        VENCIDA     :   1000197,
        APROBADA    :   1000198,
        ENVIADA     :   1000199,
        ACEPTADA    :   1000200,
        PENDIENTE   :   1000201,
    },
    ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES: {
        ACTIVO      :   1000181,
        ELIMINADA   :   1000182,
        SOLUCIONADO   :   1000183,
    },
    ESTATUS_USUARIOS_PROSPECTOS: {
        ACTIVO      :   1000188,
        INACTIVA   :   1000189,
        ELIMINADA   :   1000190,
    },
    TIPO_CORREO: {
        TRANSITO    :   1000191,
        ENTREGADO   :   1000192,
    },
});
export default ControlMestroMultiple;