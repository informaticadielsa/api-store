-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/27 
-- Description:	 cambios a direcciones SN nuevos campos 
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





ALTER TABLE public.socios_negocio_direcciones ADD snd_alias varchar NULL;
ALTER TABLE public.socios_negocio_direcciones ADD snd_direccion_envio_default bool NULL;








