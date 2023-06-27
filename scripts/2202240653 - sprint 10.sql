-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/02/24 
-- Description:	 sprint 10 
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
ALTER TABLE public.socios_negocio_direcciones ADD snd_contacto varchar NULL;
ALTER TABLE public.socios_negocio_direcciones ADD snd_telefono varchar NULL;


ALTER TABLE public.compras_finalizadas ADD cf_sap_entregado varchar NULL;
ALTER TABLE public.compras_finalizadas ADD cf_sap_entregado_usd varchar NULL;


ALTER TABLE public.productos_de_compra_finalizada ADD pcf_cantidad_entregada float4 NULL;




























