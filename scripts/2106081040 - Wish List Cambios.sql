-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/06/08 
-- Description:	 Wish List Cambios 
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





ALTER TABLE public.wish_list RENAME COLUMN wl_usu_usuario_id TO sn_socios_negocio_id;
ALTER TABLE public.wish_list RENAME COLUMN sn_socios_negocio_id TO wl_sn_socios_negocio_id;












ALTER TABLE public.wish_list DROP CONSTRAINT wish_list_fk;
ALTER TABLE public.wish_list ADD CONSTRAINT wish_list_fk FOREIGN KEY (wl_sn_socios_negocio_id) REFERENCES public.socios_negocio(sn_socios_negocio_id);



























