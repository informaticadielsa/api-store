-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2021/12/17 
-- Description:	 Dividir orden campos 
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
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_order_dividida bool NULL DEFAULT false;
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_numero_orden_usd_sap varchar NULL;
ALTER TABLE public.productos_de_compra_finalizada RENAME COLUMN pcf_order_dividida TO pcf_order_dividida_sap;


ALTER TABLE public.compras_finalizadas ADD cd_orden_dividida_sap varchar NULL;
ALTER TABLE public.compras_finalizadas RENAME COLUMN cd_orden_dividida_sap TO cf_orden_dividida_sap;
ALTER TABLE public.productos_de_compra_finalizada ALTER COLUMN pcf_numero_orden_usd_sap SET DEFAULT null;

ALTER TABLE public.compras_finalizadas ADD cf_estatus_creacion_sap_usd int4 NULL DEFAULT '-1'::integer;
ALTER TABLE public.compras_finalizadas ADD cf_descripcion_sap_usd varchar NULL;







ALTER TABLE public.productos_de_compra_finalizada ADD pcf_linea_estatus_sap varchar NULL;
