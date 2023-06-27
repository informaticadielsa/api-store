-- ============================================= 
-- Author:		DESKTOP-ARAE8GA 
-- Create date: 2023/02/09 
-- Description:	 fix orden compra id to numero de orden 
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
ALTER TABLE public.orden_de_compra DROP CONSTRAINT cart_id;
ALTER TABLE public.orden_de_compra DROP COLUMN odc_carrito_de_compra_id;
ALTER TABLE public.orden_de_compra ADD odc_numero_orden varchar NULL;
