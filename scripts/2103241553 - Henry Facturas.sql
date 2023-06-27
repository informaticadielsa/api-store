-- ============================================= 
-- Author:		Henry 
-- Create date: 2021/03/24 
-- Description:	 Mario Henry Facturas 
-- --------------------------------------------- 
-- 
-- 
SET statement_timeout = 0; 
SET lock_timeout = 0; 
SET client_encoding = 'UTF8'; 
SET standard_conforming_strings = on; 
SET check_function_bodies = false; 
SET client_min_messages = warning; 
SET row_security = off; 
SET search_path = public, pg_catalog; 
SET default_tablespace = ''; 
SET default_with_oids = false; 
-- 
-- 







ALTER TABLE public.productos ALTER COLUMN prod_cat_categoria_id DROP NOT NULL;



CREATE SEQUENCE seq_fac_facturas START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.facturas (
	fac_facturas_id int4 NOT NULL DEFAULT nextval('seq_fac_facturas'::regclass),
	fac_cardcode varchar NULL,
	fac_order_num varchar NULL,
	fac_estatus varchar NULL,
	fac_fecha_conta varchar NULL,
	fac_fecha_venc varchar NULL,
	fac_factura_total varchar NULL,
	fac_folio varchar NULL,
	fac_folio_interno varchar NULL,
	fac_id_portal varchar NULL,
	fac_ruta_pdf varchar NULL,
	fac_ruta_xml varchar NULL,
	fac_total float4 NULL,
	fac_direccion_entrega varchar NULL,
	fac_direccion_factura varchar NULL,
	fac_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	fac_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT facturas_pk PRIMARY KEY (fac_facturas_id)
);


ALTER TABLE public.socios_negocio_direcciones ADD snd_colonia varchar NULL;













ALTER TABLE public.raw_almacenes ADD calle varchar NULL;
ALTER TABLE public.raw_almacenes ADD ciudad varchar NULL;
ALTER TABLE public.raw_almacenes ADD "codigoPostal" varchar NULL;
ALTER TABLE public.raw_almacenes ADD colonia varchar NULL;
ALTER TABLE public.raw_almacenes ADD condado varchar NULL;
ALTER TABLE public.raw_almacenes ADD estado varchar NULL;
ALTER TABLE public.raw_almacenes ADD "numeroCalle" varchar NULL;
ALTER TABLE public.raw_almacenes ADD pais varchar NULL;


ALTER TABLE public.estados_paises ADD estpa_codigo_estado varchar NULL;








INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000104,
    'ESTATUS_FLETERA',
    'ACTIVO',
    TRUE,
    TRUE,
    1,
    current_date
);





INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000105,
    'ESTATUS_FLETERA',
    'INACTIVA',
    TRUE,
    TRUE,
    1,
    current_date
);







INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000106,
    'ESTATUS_FLETERA',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);




CREATE SEQUENCE seq_flet_fleteras START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.fleteras (
	flet_fletera_id int4 NOT NULL DEFAULT nextval('seq_flet_fleteras'::regclass),
	flet_nombre varchar NULL,
	flet_codigo varchar NULL,
	flet_cmm_estatus_id int4 NULL,
	flet_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	alm_usu_usuario_modificado_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT fleteras_pk PRIMARY KEY (flet_fletera_id)
);

ALTER TABLE public.fleteras RENAME COLUMN alm_usu_usuario_modificado_id TO flet_usu_usuario_modificado_id;
ALTER TABLE public.fleteras ADD CONSTRAINT fleteras_fk FOREIGN KEY (flet_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id);












ALTER TABLE public.raw_articulos ADD medida_v_altura float4 NULL;
ALTER TABLE public.raw_articulos ADD medida_v_ancho float4 NULL;
ALTER TABLE public.raw_articulos ADD medida_v_logitud float4 NULL;
ALTER TABLE public.raw_articulos ADD medida_v_peso float4 NULL;
ALTER TABLE public.raw_articulos ADD medida_v_volumen float4 NULL;




ALTER TABLE public.productos ADD prod_unidad_medida_venta varchar NULL;
ALTER TABLE public.productos ADD prod_altura float4 NULL;
ALTER TABLE public.productos ADD prod_ancho float4 NULL;
ALTER TABLE public.productos ADD prod_longitud float4 NULL;
ALTER TABLE public.productos ADD prod_peso float4 NULL;
ALTER TABLE public.productos ADD prod_volumen float4 NULL;




ALTER TABLE public.raw_socios_negocios ADD "codigoVendedor" varchar NULL;
ALTER TABLE public.raw_socios_negocios ADD "nombreVendedor" varchar NULL;










CREATE SEQUENCE seq_vendsap_vendedores_sap_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.vendedores_sap (
	vendsap_vendedores_sap_id int4 NOT NULL DEFAULT nextval('seq_vendsap_vendedores_sap_id'::regclass),
	vendsap_codigo_vendedor varchar NULL,
	vendsap_nombre_vendedor varchar NULL,
	vendsap_email varchar NULL,
	vendsap_cmm_estatus_id int4 NULL,
	vendsap_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	vendsap_usu_usuario_modificado_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT vendedores_sap_pk PRIMARY KEY (vendsap_vendedores_sap_id)
);






ALTER TABLE public.socios_negocio ADD sn_vendedor_sap varchar NULL;
ALTER TABLE public.socios_negocio RENAME COLUMN sn_vendedor_sap TO sn_vendedor_codigo_sap;










INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000107,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'PENDIENTE',
    TRUE,
    TRUE,
    1,
    current_date
);

INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000108,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'CANCELADA',
    TRUE,
    TRUE,
    1,
    current_date
);

INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000109,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'ABIERTA',
    TRUE,
    TRUE,
    1,
    current_date
);


INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000110,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'CERRADA',
    TRUE,
    TRUE,
    1,
    current_date
);


INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000111,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'ELECCION PENDIENTE',
    TRUE,
    TRUE,
    1,
    current_date
);



INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000112,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'APROBADA',
    TRUE,
    TRUE,
    1,
    current_date
);


INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000113,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'RECHAZADA',
    TRUE,
    TRUE,
    1,
    current_date
);


INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000114,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'REPLICA PENDIENTE',
    TRUE,
    TRUE,
    1,
    current_date
);

INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000115,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'REPLICA ERROR',
    TRUE,
    TRUE,
    1,
    current_date
);


INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000116,
    'ESTATUS_STATUS_ORDEN_FINALIZADA',
    'AUTORIZACION PENDIENTE',
    TRUE,
    TRUE,
    1,
    current_date
);







ALTER TABLE public.compras_finalizadas ADD cf_estatus_orden int4 NULL;
ALTER TABLE public.compras_finalizadas ADD cf_fletera_id int4 NULL;
ALTER TABLE public.compras_finalizadas ADD CONSTRAINT fletera_id FOREIGN KEY (cf_fletera_id) REFERENCES public.fleteras(flet_fletera_id);
ALTER TABLE public.compras_finalizadas ADD CONSTRAINT estatus_id_orden FOREIGN KEY (cf_estatus_orden) REFERENCES public.controles_maestros_multiples(cmm_control_id);



ALTER TABLE public.raw_socios_negocios ADD usoCfdi varchar NULL;
ALTER TABLE public.raw_socios_negocios ADD rfc varchar NULL;
ALTER TABLE public.raw_socios_negocios RENAME COLUMN usocfdi TO "usoCfdi";


ALTER TABLE public.socios_negocio ADD sn_condiciones_credito varchar NULL;















































