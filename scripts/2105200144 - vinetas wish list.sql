-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/20 
-- Description:	 vinetas wish list 
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
ALTER TABLE public.productos ADD viñetas json NULL;
ALTER TABLE public.productos RENAME COLUMN viñetas TO prod_viñetas;





CREATE SEQUENCE seq_wl_wish_list START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.wish_list (
	wl_wish_list_id int4 NOT NULL DEFAULT nextval('seq_wl_wish_list'::regclass),
	wl_nombre varchar NOT NULL,
	wl_usu_usuario_id int4 NOT NULL,
	wl_cmm_estatus_id int4 NOT NULL,
	wl_usu_usuario_creador_id int4 NOT NULL,
	"createdAt" timestamp(0) NULL,
	wl_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT wish_list_pk PRIMARY KEY (wl_wish_list_id),
	CONSTRAINT wish_list_fk FOREIGN KEY (wl_wish_list_id) REFERENCES public.usuarios(usu_usuario_id)
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
		1000161,
		'ESTATUS_WISH_LIST',
		'ACTIVO',
		true,
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
		1000162,
		'ESTATUS_WISH_LIST',
		'INACTIVO',
		true,
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
		1000163,
		'ESTATUS_WISH_LIST',
		'ELIMINADO',
		true,
		true,
		1,
		current_date
	);










CREATE SEQUENCE seq_wl_wish_list_productos START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.wish_list_productos (
	wlp_wish_list_productos int4 NOT NULL DEFAULT nextval('seq_wl_wish_list_productos'::regclass),
	wlp_wish_list_id int4 NOT NULL,
	wlp_prod_producto_id int4 NOT NULL,
	wlp_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	wlp_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT wish_list_productos_pk PRIMARY KEY (wlp_wish_list_productos),
	CONSTRAINT wlp_wp_fk FOREIGN KEY (wlp_wish_list_id) REFERENCES public.wish_list(wl_wish_list_id),
	CONSTRAINT productos_wlp_fk FOREIGN KEY (wlp_prod_producto_id) REFERENCES public.productos(prod_producto_id)
);



ALTER TABLE public.wish_list DROP CONSTRAINT wish_list_fk;
ALTER TABLE public.wish_list ADD CONSTRAINT wish_list_fk FOREIGN KEY (wl_usu_usuario_id) REFERENCES public.usuarios(usu_usuario_id);

ALTER TABLE public.wish_list_productos ADD wlp_cantidad int4 NULL;














