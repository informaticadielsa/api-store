-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/10 
-- Description:	 Mario Fecha y actualizacion menu 
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


ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_fecha_envio date;

update menus set 
mn_nombre = 'Compra rapida',
mn_ruta  = '/quotes'
where 
mn_nombre = 'Cotizacion y/o compras';


update menus set 
mn_nombre = 'Cotizaciones y proyectos',
mn_ruta  = '/quotelist'
where 
mn_nombre = 'Lista de compras';

ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_motivo_cancelacion character varying;

      
insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000099,
	'ESTATUS_COTIZACION_PROYECTO',
	'CANCELADA',
	true,
	true,
	1,
	current_date
);