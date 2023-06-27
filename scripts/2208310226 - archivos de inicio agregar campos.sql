-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/08/31 
-- Description:	 archivos de inicio agregar campos 
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
ALTER TABLE public.archivos_de_inicio ADD adi_titulo2 varchar(500) NULL;
ALTER TABLE public.archivos_de_inicio ADD adi_ruta_archivo_2 varchar(500) NULL;

ALTER TABLE public.archivos_de_inicio RENAME COLUMN adi_titulo2 TO adi_titulo_2;

