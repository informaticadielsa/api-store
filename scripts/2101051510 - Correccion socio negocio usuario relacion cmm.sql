-- ============================================= 
-- Author:		Henry Mirhail Kishi Salinas 
-- Create date: 2021/01/05 
-- Description:	 Correccion socio negocio usuario relacion cmm 
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
ALTER TABLE public.socios_negocio_usuario ADD CONSTRAINT socios_negocio_usuario_cmm FOREIGN KEY (snu_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id);
