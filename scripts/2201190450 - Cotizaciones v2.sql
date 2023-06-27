-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/01/19 
-- Description:	 Cotizaciones v2 
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




CREATE SEQUENCE seq_cot_cotizacion START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;



CREATE TABLE public.cotizaciones (
	cot_cotizacion_id int4 NOT NULL DEFAULT nextval('seq_cot_cotizacion'::regclass),
	cot_numero_orden varchar(500) NOT NULL,
	cot_sn_socios_negocio_id int4 NOT NULL,
	cot_total_cotizacion float8 NULL,
	cot_referencia varchar NULL,
	cot_cmm_estatus_id int4 NOT NULL,
	cot_motivo_cancelacion varchar NULL,
	cot_usu_usuario_vendedor_id int4 NULL,
	cot_fecha_vencimiento date NOT NULL,
	"createdAt" timestamp NOT NULL,
	cot_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT cotizaciones_pk PRIMARY KEY (cot_cotizacion_id),
	CONSTRAINT cmm_status FOREIGN KEY (cot_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT cotizaciones_fk FOREIGN KEY (cot_sn_socios_negocio_id) REFERENCES public.socios_negocio(sn_socios_negocio_id)
);










CREATE SEQUENCE seq_cotp_cotizaciones_productos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;





CREATE TABLE public.cotizaciones_productos (
	cotp_cotizaciones_productos_id int4 NOT NULL DEFAULT nextval('seq_cotp_cotizaciones_productos_id'::regclass),
	cotp_prod_producto_id int4 NOT NULL,
	cotp_cotizacion_id int4 NOT NULL,
	cotp_producto_cantidad int4 NOT NULL,
	cotp_precio_base float4 NULL,
	cotp_precio_mejor_descuento float4 NULL,
	cotp_descuento_porcentaje_cotizacion float4 NULL,
	cotp_precio_descuento_cotizacion float4 NULL,
	cotp_usu_descuento_cotizacion int4 NULL,
	cotp_disponible_para_compra bool NULL,
	cotp_back_order bool NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL
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
    1000177,
    'ESTATUS_COTIZACION',
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
    1000178,
    'ESTATUS_COTIZACION',
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
    1000179,
    'ESTATUS_COTIZACION',
    'ELIMINADA',
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
    1000180,
    'ESTATUS_COTIZACION',
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
    11,
    'TIEMPO_CADUCIDAD_COTIZACIONES',
    10,
    TRUE,
    TRUE,
    1,
    current_date
);







ALTER TABLE public.cotizaciones_productos ALTER COLUMN cotp_usu_descuento_cotizacion SET DEFAULT 0;
ALTER TABLE public.cotizaciones_productos ALTER COLUMN cotp_usu_descuento_cotizacion DROP DEFAULT;
ALTER TABLE public.cotizaciones_productos ALTER COLUMN cotp_descuento_porcentaje_cotizacion SET DEFAULT 0;

ALTER TABLE public.cotizaciones_productos ADD cotp_usu_usuario_modificado_id int4 NULL;

