-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/04/04 
-- Description:	 lotes detalle agregar carrito 
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





ALTER TABLE public.productos_carrito_de_compra ADD pcdc_lote_detail varchar NULL;
ALTER TABLE public.safe_productos_carrito_de_compra ADD pcdc_lote_detail varchar NULL;


ALTER TABLE public.productos_carrito_de_compra DROP CONSTRAINT producto_id_carrito_id_unico;






