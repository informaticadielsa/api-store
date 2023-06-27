CREATE TABLE public.safe_carrito_de_compras (
    cdc_carrito_de_compra_id int4 NOT NULL DEFAULT nextval('seq_cdc_carrito_de_compra_id'::regclass),
    cdc_numero_orden varchar NOT NULL,
    cdc_usu_usuario_vendedor_id int4 NULL,
    cdc_sn_socio_de_negocio_id int4 NULL,
    cdc_descuento_extra int4 NULL,
    cdc_total_carrito float8 NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NULL,
    cdc_lista_precio int4 NULL,
    cdc_project_candidate bool NOT NULL DEFAULT false,
    cdc_from_project bool NOT NULL DEFAULT false,
    cdc_with_coupon bool NOT NULL DEFAULT false,
    cdc_cmm_tipo_envio_id int4 NULL,
    cdc_direccion_envio_id int4 NULL,
    cdc_alm_almacen_recoleccion int4 NULL,
    cdc_cmm_tipo_compra_id int4 NULL,
    cdc_fletera_id int4 NULL,
    cdc_costo_envio float4 NULL,
    cdc_promcup_promociones_cupones_id int4 NULL,
    cdc_forma_pago_codigo varchar NULL,
    cdc_referencia varchar NULL,
    cdc_cfdi varchar NULL
);







ALTER TABLE public.safe_carrito_de_compras ALTER COLUMN cdc_with_coupon DROP NOT NULL;
ALTER TABLE public.safe_carrito_de_compras ALTER COLUMN cdc_from_project DROP NOT NULL;
ALTER TABLE public.safe_carrito_de_compras ALTER COLUMN cdc_project_candidate DROP NOT NULL;
ALTER TABLE public.safe_carrito_de_compras ALTER COLUMN "createdAt" DROP NOT NULL;
ALTER TABLE public.safe_carrito_de_compras ALTER COLUMN cdc_numero_orden DROP NOT NULL;










CREATE TABLE public.safe_productos_carrito_de_compra (
    pcdc_producto_carrito_id int4 NOT NULL DEFAULT nextval('seq_pcdc_producto_carrito_id'::regclass),
    pcdc_carrito_de_compra_id int4 NOT NULL,
    pcdc_prod_producto_id int4 NOT NULL,
    pcdc_producto_cantidad int4 NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NULL,
    pcdc_lista_precio bool NULL,
    pcdc_precio float8 NULL,
    pcdc_prod_producto_id_regalo int4 NULL,
    pcdc_cantidad_producto_regalo int4 NULL,
    pcdc_descuento_promocion float8 NULL,
    pcdc_prod_producto_id_promocion int4 NULL,
    pcdc_cantidad_producto_promocion int4 NULL,
    pcdc_cupon_aplicado bool NULL DEFAULT false,
    pcdc_mejor_descuento int4 NULL,
    pcdc_almacen_surtido int4 NULL,
    pcdc_no_disponible_para_compra bool NOT NULL DEFAULT false,
    pcdc_back_order bool NOT NULL DEFAULT false,
    pcdc_validado bool NOT NULL DEFAULT false
);


ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_no_disponible_para_compra DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_back_order DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_validado DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_producto_carrito_id DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_carrito_de_compra_id DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_prod_producto_id DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN pcdc_producto_cantidad DROP NOT NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ALTER COLUMN "createdAt" DROP NOT NULL;



