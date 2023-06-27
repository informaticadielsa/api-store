-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/07/15 
-- Description:	 cambioAlAutoincrementableCarrito 
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
CREATE SEQUENCE seq_safe_cdc_carrito_de_compra_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

ALTER TABLE public.safe_carrito_de_compras ALTER COLUMN cdc_carrito_de_compra_id SET DEFAULT nextval('seq_safe_cdc_carrito_de_compra_id'::regclass);




