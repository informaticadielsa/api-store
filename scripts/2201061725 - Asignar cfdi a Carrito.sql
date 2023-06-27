-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/01/06 
-- Description:	 Asignar cfdi a Carrito 
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
ALTER TABLE public.carrito_de_compras ADD cdc_cfdi varchar NULL;
ALTER TABLE public.compras_finalizadas ADD cf_cfdi varchar NULL;
ALTER TABLE public.pre_compras_finalizadas ADD cf_cfdi varchar NULL;

