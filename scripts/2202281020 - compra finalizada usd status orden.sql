-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/02/28 
-- Description:	 compra finalizada usd status orden 
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


ALTER TABLE public.compras_finalizadas ADD cf_estatus_orden_usd int4 NULL;

























