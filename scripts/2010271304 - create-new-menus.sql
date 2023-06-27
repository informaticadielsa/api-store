-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/10/27 
-- Description:	 create-new-menus 
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

INSERT INTO menus
(
    mn_nombre,
    mn_ruta,
    mn_cmm_estatus_id,
    mn_usu_usuario_creado_por_id,
    "createdAt"
)VALUES(
    'Usuarios',
    '/users',
    1000004,
    1,
    current_date
);


INSERT INTO menus
(
    mn_nombre,
    mn_ruta,
    mn_cmm_estatus_id,
    mn_usu_usuario_creado_por_id,
    "createdAt"
)VALUES(
    'Roles',
    '/roles',
    1000004,
    1,
    current_date
);
