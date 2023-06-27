-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/16 
-- Description:	 Mario Mejoras cotizaciones_proyectos 
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

insert into controles_maestros_multiples 
(
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
)
values
(
	11,
	'TIEMPO_CADUCIDAD_COTIZACION_PROYECTO',
	'30',
	false,
	true,
	1,
	current_date
);

insert into controles_maestros_multiples 
(
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
)
values
(
	12,
	'DESCUENTO_MAXIMO_COTIZACION_PROYECTO',
	'40',
	false,
	true,
	1,
	current_date
);


insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000100,
	'ESTATUS_COTIZACION_PROYECTO',
	'FINALIZADA',
	true,
	true,
	1,
	current_date
);

ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_descuento_extra integer;