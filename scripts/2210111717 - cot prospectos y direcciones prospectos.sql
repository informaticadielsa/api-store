-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/10/11 
-- Description:	 cot prospectos y direcciones prospectos 
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
CREATE SEQUENCE seq_upd_direcciones_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.usuarios_prospectos_direcciones (
	upd_direcciones_id int4 NOT NULL DEFAULT nextval('seq_upd_direcciones_id'::regclass),
	upd_pais_id int4 NULL,
	upd_estado_id int4 NULL,
	upd_ciudad varchar NULL,
	upd_direccion varchar NULL,
	upd_direccion_num_ext varchar NULL,
	upd_direccion_num_int varchar NULL,
	upd_direccion_telefono varchar NULL,
	upd_calle1 varchar NULL,
	upd_calle2 varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	upd_codigo_postal varchar NULL,
	upd_colonia varchar NULL,
	upd_up_usuarios_prospectos_id int4 NULL,
	upd_alias varchar NULL,
	upd_contacto varchar NULL,
	upd_telefono varchar NULL,
	CONSTRAINT prospectos_direcciones_pk PRIMARY KEY (upd_direcciones_id)
);

ALTER TABLE public.cotizaciones ADD cot_tratamiento varchar NULL;
ALTER TABLE public.cotizaciones ADD cot_prospecto bool NULL;
ALTER TABLE public.cotizaciones ADD cot_up_usuarios_prospectos_id int4 NULL;
ALTER TABLE public.cotizaciones ALTER COLUMN cot_numero_orden DROP NOT NULL;
ALTER TABLE public.cotizaciones ALTER COLUMN cot_sn_socios_negocio_id DROP NOT NULL;



ALTER TABLE public.cotizaciones_productos RENAME COLUMN cotp_precio_base TO cotp_precio_lista;
ALTER TABLE public.cotizaciones_productos RENAME COLUMN cotp_precio_mejor_descuento TO cotp_precio_menos_promociones;
ALTER TABLE public.cotizaciones_productos RENAME COLUMN cotp_descuento_porcentaje_cotizacion TO cotp_descuento_porcentaje_vendedor;
ALTER TABLE public.cotizaciones_productos RENAME COLUMN cotp_precio_descuento_cotizacion TO cotp_precio_descuento_vendedor;
ALTER TABLE public.cotizaciones_productos RENAME COLUMN cotp_descuento_porcentaje_vendedor TO cotp_porcentaje_descuento_vendedor;
ALTER TABLE public.cotizaciones_productos ADD cotp_tipo_precio_lista varchar NULL;
COMMENT ON COLUMN public.cotizaciones_productos.cotp_precio_descuento_vendedor IS 'Precio Final de descuento vendedor aplicado al mejor precio promocion';
COMMENT ON COLUMN public.cotizaciones_productos.cotp_porcentaje_descuento_vendedor IS 'Porcentaje de descuento que le dara el vendedor al mejor precio';
ALTER TABLE public.cotizaciones_productos RENAME COLUMN cotp_precio_lista TO cotp_precio_base_lista;
ALTER TABLE public.cotizaciones_productos ADD cotp_dias_resurtimiento int4 NULL;
ALTER TABLE public.cotizaciones_productos ADD cotp_almacen_linea int4 NULL;
ALTER TABLE public.cotizaciones_productos ADD cotp_recoleccion_resurtimiento bool NULL DEFAULT false;
ALTER TABLE public.cotizaciones_productos ADD pcf_fecha_entrega timestamp(0) NULL;
ALTER TABLE public.cotizaciones_productos ADD cotp_backorder_precio_lista bool NULL;
ALTER TABLE public.cotizaciones_productos ADD cotp_descuento_porcentual float4 NULL;
ALTER TABLE public.cotizaciones_productos RENAME COLUMN pcf_fecha_entrega TO cotp_fecha_entrega;

ALTER TABLE public.cotizaciones ADD cot_surtir_un_almacen bool NULL;
ALTER TABLE public.cotizaciones ADD cot_tipo_politica_envio varchar NULL;
ALTER TABLE public.cotizaciones ADD cot_aplica_politica_envio bool NULL;



