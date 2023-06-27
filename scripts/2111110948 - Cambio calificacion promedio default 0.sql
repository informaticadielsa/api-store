-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/11/11 
-- Description:	 Cambio calificacion promedio default 0 
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
ALTER TABLE public.productos ALTER COLUMN prod_calificacion_promedio SET DEFAULT 0;
