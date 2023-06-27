-- ============================================= 
-- Author:		Eduardo 
-- Create date: 2022/11/09 
-- Description:	 agregar menu integraciones front 
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
INSERT INTO public.menus
(
    mn_menu_id,
    mn_nombre, 
    mn_ruta, 
    mn_cmm_estatus_id, 
    mn_usu_usuario_creado_por_id, 
    "createdAt", 
    mn_usu_usuario_modificado_id, 
    "updatedAt", 
    mn_tipo_menu_id
    )
VALUES
(
    46,
    'Integraciones', 
    '/integrations', 
    1000004, 
    1, 
    '2022-02-11 00:00:00.000', 
    NULL,
    NULL, 
    1000054
);


INSERT INTO public.roles_permisos
(
    rol_per_rol_rol_id, 
    rol_per_mu_menu_id, 
    rol_per_ver, 
    rol_per_editar, 
    rol_per_crear, 
    rol_per_eliminar, 
    "createdAt", 
    "updatedAt"
)
VALUES
(
    1, 
    46, 
    true, 
    true, 
    true, 
    true, 
    '2022-11-08 00:00:00.000', 
    NULL
);