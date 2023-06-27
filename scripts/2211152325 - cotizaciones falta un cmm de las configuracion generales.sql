-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/11/15 
-- Description:	 cotizaciones falta un cmm de las configuracion generales 
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
INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    59,
    'COTIZACIONES_CONFIGURACIONES',
    'REQUIERE FLUJO DE APROBACION',
    FALSE,
    TRUE,
    1,
    current_date
);




-- Auto-generated SQL script #202211031626
DELETE FROM public.controles_maestros_multiples
    WHERE cmm_control_id=59;
DELETE FROM public.controles_maestros_multiples
    WHERE cmm_control_id=60;
DELETE FROM public.controles_maestros_multiples
    WHERE cmm_control_id=61;
DELETE FROM public.controles_maestros_multiples
    WHERE cmm_control_id=62;
DELETE FROM public.controles_maestros_multiples
    WHERE cmm_control_id=63;
DELETE FROM public.controles_maestros_multiples
    WHERE cmm_control_id=64;





INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(59, 'COT_CONFIG_REQUIERE_FLUJO_APROBACION', 'FALSE', false, true, 1, '2022-11-03 00:00:00.000', NULL, NULL);
INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(60, 'COT_CONFIG_AGREGAR_Y_ELIMINAR_PRODUCTOS', 'FALSE', false, true, 1, '2022-10-20 00:00:00.000', NULL, NULL);
INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(61, 'COT_CONFIG_AGREGAR_O_REDUCIR_CANTIDADES', 'FALSE', false, true, 1, '2022-10-20 00:00:00.000', NULL, NULL);
INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(62, 'COT_CONFIG_CAMBIAR_PRECIOS_O_DESCUENTOS', 'FALSE', false, true, 1, '2022-10-20 00:00:00.000', NULL, NULL);
INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(63, 'COT_CONFIG_CAMBIAR_DIRECCION_ENVIO', 'FALSE', false, true, 1, '2022-10-20 00:00:00.000', NULL, NULL);
INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(64, 'COT_CONFIG_ADQUIRIR_PARCIALMENTE', 'FALSE', false, true, 1, '2022-10-20 00:00:00.000', NULL, NULL);
