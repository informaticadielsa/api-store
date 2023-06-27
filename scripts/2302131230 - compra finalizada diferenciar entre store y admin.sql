-- ============================================= 
-- Author:		DESKTOP-V19GCEH 
-- Create date: 2023/02/13 
-- Description:	 compra finalizada diferenciar entre store y admin 
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
ALTER TABLE public.compras_finalizadas ADD cf_generado_en varchar NULL;