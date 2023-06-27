-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/06/08 
-- Description:	 backorder precio lista stock inactivo 
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
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_backorder_precio_lista bool NULL;
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_tipo_precio_lista varchar NULL;
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_precio_base_venta float4 NULL;
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_descuento_porcentual float4 NULL;
