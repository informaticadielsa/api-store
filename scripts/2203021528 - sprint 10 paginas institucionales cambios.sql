-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/03/02 
-- Description:	 sprint 10 paginas institucionales cambios 
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
ALTER TABLE public.paginas_institucionales ADD pi_seccion_cmm int4 NULL;
ALTER TABLE public.categorias ADD cat_nombre_tienda varchar NULL;
