-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/02/22 
-- Description:	 lotes productos 
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







CREATE SEQUENCE seq_spd_stocks_productos_detalle_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;




CREATE TABLE public.stocks_productos_detalle (
	spd_stocks_productos_detalle_id int4 NOT NULL DEFAULT nextval('seq_spd_stocks_productos_detalle_id'::regclass),
	spd_prod_producto_id int4 NOT NULL,
	spd_alm_almacen_id int4 NOT NULL,
	spd_codigo_lote varchar NOT NULL,
	spd_disponible float4 NULL,
	spd_cantidad float4 NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL
);
ALTER TABLE public.stocks_productos_detalle RENAME COLUMN spd_cantidad TO spd_apartado;



ALTER TABLE public.stocks_productos_detalle ADD CONSTRAINT producto_id FOREIGN KEY (spd_prod_producto_id) REFERENCES public.productos(prod_producto_id);
ALTER TABLE public.stocks_productos_detalle ADD CONSTRAINT stocks_productos_detalle_fk FOREIGN KEY (spd_alm_almacen_id) REFERENCES public.almacenes(alm_almacen_id);
ALTER TABLE public.stocks_productos_detalle ADD CONSTRAINT stocks_productos_detalle_pk PRIMARY KEY (spd_stocks_productos_detalle_id);
