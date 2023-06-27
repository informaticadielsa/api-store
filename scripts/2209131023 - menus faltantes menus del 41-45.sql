-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/09/13 
-- Description:	 menus faltantes menus del 41-45 
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
(mn_menu_id, mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt", mn_usu_usuario_modificado_id, "updatedAt", mn_tipo_menu_id)
VALUES(41, 'Newsletter', '/newsletter', 1000004, 1, '2022-02-11 00:00:00.000', NULL, NULL, 1000054);
INSERT INTO public.menus
(mn_menu_id, mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt", mn_usu_usuario_modificado_id, "updatedAt", mn_tipo_menu_id)
VALUES(42, 'CMS', '/configurations', 1000004, 1, '2022-02-11 00:00:00.000', NULL, NULL, 1000054);
INSERT INTO public.menus
(mn_menu_id, mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt", mn_usu_usuario_modificado_id, "updatedAt", mn_tipo_menu_id)
VALUES(43, 'Cupones', '/coupons', 1000004, 1, '2022-02-11 00:00:00.000', NULL, NULL, 1000054);
INSERT INTO public.menus
(mn_menu_id, mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt", mn_usu_usuario_modificado_id, "updatedAt", mn_tipo_menu_id)
VALUES(44, 'Políticas de Envío', '/shippingtypes', 1000004, 1, '2022-02-11 00:00:00.000', NULL, NULL, 1000054);
INSERT INTO public.menus
(mn_menu_id, mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt", mn_usu_usuario_modificado_id, "updatedAt", mn_tipo_menu_id)
VALUES(45, 'Ordenes Fallidas', '/order_failed', 1000004, 1, '2022-02-11 00:00:00.000', NULL, NULL, 1000054);



-- Auto-generated SQL script #202209071930
UPDATE public.roles_permisos
	SET rol_per_editar=true,rol_per_eliminar=true,rol_per_ver=true,rol_per_crear=true
	WHERE rol_per_roles_permisos_id=120;
UPDATE public.roles_permisos
	SET rol_per_editar=true,rol_per_eliminar=true,rol_per_ver=true,rol_per_crear=true
	WHERE rol_per_roles_permisos_id=123;
UPDATE public.roles_permisos
	SET rol_per_editar=true,rol_per_eliminar=true,rol_per_ver=true,rol_per_crear=true
	WHERE rol_per_roles_permisos_id=126;
UPDATE public.roles_permisos
	SET rol_per_editar=true,rol_per_eliminar=true,rol_per_ver=true,rol_per_crear=true
	WHERE rol_per_roles_permisos_id=129;
UPDATE public.roles_permisos
	SET rol_per_editar=true,rol_per_eliminar=true,rol_per_ver=true,rol_per_crear=true
	WHERE rol_per_roles_permisos_id=132;
