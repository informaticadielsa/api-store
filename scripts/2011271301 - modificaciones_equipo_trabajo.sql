-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/11/27 
-- Description:	 modificaciones_equipo_trabajo 
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
ALTER TABLE public.usuarios_equipo_de_trabajo DROP COLUMN uet_usu_usuario_asignado_por_id;

ALTER TABLE public.usuarios_equipo_de_trabajo DROP COLUMN uet_usu_usuario_modificado_por_id;

ALTER TABLE public.usuarios_equipo_de_trabajo DROP COLUMN uet_cmm_estatus_id;

ALTER TABLE public.usuarios_equipo_de_trabajo DROP COLUMN uet_usuario_equipo_de_trabajo_id;

--ALTER TABLE public.menus RENAME cm_usu_usario_creado_id  TO mn_usu_usuario_creado_por_id;


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt"
)
values   
(
	'Equipos de trabajo',
	'/equipos_trabajo',
	1000004,
	1,
	current_date
);

