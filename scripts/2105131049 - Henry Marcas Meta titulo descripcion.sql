-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/13 
-- Description:	 Henry Marcas Meta titulo descripcion 
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






ALTER TABLE public.marcas ADD mar_meta_titulo varchar NULL;
ALTER TABLE public.marcas ADD mar_meta_descripcion varchar NULL;
