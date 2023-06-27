-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/24 
-- Description:	 resenas mejoras 24-05 
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
ALTER TABLE public.resenas_productos RENAME COLUMN rep_usu_usuario_id TO rep_snu_usuario_snu_id;
ALTER TABLE public.resenas_productos DROP CONSTRAINT usuarios_fk;
ALTER TABLE public.resenas_productos ADD CONSTRAINT resena_snu_id FOREIGN KEY (rep_snu_usuario_snu_id) REFERENCES public.socios_negocio_usuario(snu_usuario_snu_id);

