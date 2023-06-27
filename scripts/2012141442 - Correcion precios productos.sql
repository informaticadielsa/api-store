-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/12/14 
-- Description:	 Correcion precios productos 
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
ALTER TABLE public.producto_precios
    ALTER COLUMN prodpre_precio TYPE double precision;

insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt"
)
values 
(
	'Socios de negocios',
	'/socios_de_negocio',
	1000004,
	1,
	current_date
);