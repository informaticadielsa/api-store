-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/06/15 
-- Description:	 Mario Usuarios_Socios_De_Negocios_B2B 
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
ALTER TABLE public.socios_negocio_usuario
    ADD COLUMN snu_snu_usuario_snu_creador_id integer;
ALTER TABLE public.socios_negocio_usuario
    ADD CONSTRAINT usuario_socio_de_negocio_creador FOREIGN KEY (snu_snu_usuario_snu_creador_id)
    REFERENCES public.socios_negocio_usuario (snu_usuario_snu_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE public.socios_negocio_usuario
    ADD COLUMN snu_super_usuario boolean NOT NULL DEFAULT false;

ALTER TABLE public.socios_negocio_usuario
    ADD COLUMN snu_menu_roles jsonb;

-------------------- CAMPO VIDEO 
ALTER TABLE public.productos
    ADD COLUMN prod_video_url character varying;

-----  Producto nuevo


insert into controles_maestros_multiples 
(
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values 
(
	1000168,
	'PRODUCTO_NUEVO',
	'10',
	true,
	true,
	1,
	current_date
);


ALTER TABLE public.compras_finalizadas
    ALTER COLUMN cf_vendido_por_usu_usuario_id DROP NOT NULL;

---- Borramos los roles
ALTER TABLE public.socios_negocio_usuario DROP COLUMN snu_rol_rol_id;

ALTER TABLE public.socios_negocio_usuario
    ADD COLUMN snu_area character varying(100);

ALTER TABLE public.socios_negocio_usuario
    ADD COLUMN snu_puesto character varying(100);

------------------------------ COTIZACIONES (CAMBIOS)

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_mejor_descuento;

ALTER TABLE public.productos_cotizaciones
    ADD COLUMN pc_mejor_descuento integer;