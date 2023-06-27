-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/08/02 
-- Description:	 politicas envio monto minimo 
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
ALTER TABLE public.politicas_envio ADD poe_monto_compra_minimo float4 NULL;
COMMENT ON COLUMN public.politicas_envio.poe_monto_compra_minimo IS 'Valor debe ser en USD';


ALTER TABLE public.carrito_de_compras ADD cdc_politica_envio_activa bool NULL DEFAULT false;
ALTER TABLE public.carrito_de_compras ADD cdc_politica_envio_tipo varchar NULL;

ALTER TABLE public.carrito_de_compras RENAME COLUMN cdc_politica_envio_tipo TO cdc_politica_envio_nombre;



INSERT INTO public.politicas_envio
(poe_nombre, poe_monto, poe_monto_compra_minimo, poe_dias_minimo, poe_dias_maximo, poe_cmm_tipo_politica_envio, poe_cmm_estatus_id, poe_usu_usuario_creador_id, "createdAt", poe_usu_usuario_modificador_id, "updatedAt")
VALUES('Envio Mexico Gratis', 0.0, 250.0, 0, 0, 14, 1000172, 1, '2022-07-28 06:37:55.000', NULL, '2022-07-28 06:37:55.000');
INSERT INTO public.politicas_envio
(poe_nombre, poe_monto, poe_monto_compra_minimo, poe_dias_minimo, poe_dias_maximo, poe_cmm_tipo_politica_envio, poe_cmm_estatus_id, poe_usu_usuario_creador_id, "createdAt", poe_usu_usuario_modificador_id, "updatedAt")
VALUES('Envio Mexico', 250.0, 0.0, 0, 0, 14, 1000172, 1, '2022-07-28 06:37:55.000', NULL, '2022-07-28 06:37:55.000');
INSERT INTO public.politicas_envio
(poe_nombre, poe_monto, poe_monto_compra_minimo, poe_dias_minimo, poe_dias_maximo, poe_cmm_tipo_politica_envio, poe_cmm_estatus_id, poe_usu_usuario_creador_id, "createdAt", poe_usu_usuario_modificador_id, "updatedAt")
VALUES('Envio Monterrey Gratis', 0.0, 250.0, 0, 0, 14, 1000172, 1, '2022-07-28 06:37:55.000', NULL, '2022-07-28 06:37:55.000');
INSERT INTO public.politicas_envio
(poe_nombre, poe_monto, poe_monto_compra_minimo, poe_dias_minimo, poe_dias_maximo, poe_cmm_tipo_politica_envio, poe_cmm_estatus_id, poe_usu_usuario_creador_id, "createdAt", poe_usu_usuario_modificador_id, "updatedAt")
VALUES('Envio Monterrey', 250.0, 0.0, 0, 0, 14, 1000172, 1, '2022-07-28 06:37:55.000', NULL, '2022-07-28 06:37:55.000');
INSERT INTO public.politicas_envio
(poe_nombre, poe_monto, poe_monto_compra_minimo, poe_dias_minimo, poe_dias_maximo, poe_cmm_tipo_politica_envio, poe_cmm_estatus_id, poe_usu_usuario_creador_id, "createdAt", poe_usu_usuario_modificador_id, "updatedAt")
VALUES('Envio Foraneo Gratis', 0.0, 250.0, 0, 0, 14, 1000172, 1, '2022-07-28 06:37:55.000', NULL, '2022-07-28 06:37:55.000');




ALTER TABLE public.carrito_de_compras ADD cdc_politica_envio_surtir_un_solo_almacen bool NULL DEFAULT false;
ALTER TABLE public.compras_finalizadas ADD cf_politica_envio_nombre varchar NULL;
