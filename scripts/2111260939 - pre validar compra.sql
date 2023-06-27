-- ============================================= 
-- Author:		henry kishi 
-- Create date: 2021/11/26 
-- Description:	 pre validar compra 
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
CREATE TABLE public.pre_compras_finalizadas (
	cf_compra_finalizada_id int4 NOT NULL DEFAULT nextval('seq_cf_compra_finalizada_id'::regclass),
	cf_compra_numero_orden varchar(100) NOT NULL,
	cf_compra_fecha date NOT NULL,
	cf_vendido_por_usu_usuario_id int4 NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL,
	cf_cmm_tipo_compra_id int4 NOT NULL,
	cf_vendido_a_socio_negocio_id int4 NOT NULL,
	cf_cmm_tipo_envio_id int4 NOT NULL,
	cf_direccion_envio_id int4 NULL,
	cf_cmm_tipo_impuesto int4 NULL DEFAULT 1000085,
	cf_alm_almacen_recoleccion int4 NULL,
	cf_total_compra float8 NULL,
	cf_estatus_orden int4 NULL,
	cf_fletera_id int4 NULL,
	cf_sap_metodos_pago_codigo varchar NULL,
	cf_sap_forma_pago_codigo varchar NULL,
	cf_estatus_creacion_sap int4 NULL DEFAULT '-1'::integer,
	cf_descripcion_sap varchar NULL,
	cf_referencia varchar NULL,
	cf_promcup_promociones_cupones_id int4 NULL,
	CONSTRAINT compras_finalizadas_pkey_1 PRIMARY KEY (cf_compra_finalizada_id),
	CONSTRAINT orden_compra_unica_1 UNIQUE (cf_compra_numero_orden)
);


CREATE TABLE public.pre_productos_de_compra_finalizada (
	pcf_producto_compra_finalizada_id int4 NOT NULL DEFAULT nextval('seq_pcf_producto_compra_finalizada_id'::regclass),
	pcf_cf_compra_finalizada_id int4 NOT NULL,
	pcf_prod_producto_id int4 NOT NULL,
	pcf_cantidad_producto int4 NOT NULL,
	"createdAt" timestamptz NOT NULL,
	"updatedAt" timestamptz NULL,
	pcf_precio float8 NULL,
	pcf_prod_producto_id_regalo int4 NULL,
	pcf_cantidad_producto_regalo int4 NULL,
	pcf_descuento_promocion float8 NULL,
	pcf_prod_producto_id_promocion int4 NULL,
	pcf_cantidad_producto_promocion int4 NULL,
	pcf_cupon_aplicado bool NULL DEFAULT false,
	pcf_descuento_producto int4 NULL,
	pcf_sumatorio_mas_vendido_validador bool NOT NULL DEFAULT false,
	CONSTRAINT productos_de_compra_finalizada_pkey_1 PRIMARY KEY (pcf_producto_compra_finalizada_id)
);




























