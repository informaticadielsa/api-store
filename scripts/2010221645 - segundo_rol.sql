-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/10/22 
-- Description:	Agregamos un nuevo Rol 
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
INSERT INTO public.roles
(
    rol_nombre,
    rol_descripcion,
    rol_cmm_estatus,
    rol_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    'SegundoRoL',
    'Rol principal, todos los permisos para el usuario.',
    1000007,
	1,
    current_date
);