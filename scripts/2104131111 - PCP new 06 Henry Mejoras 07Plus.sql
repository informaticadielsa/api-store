-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/25 
-- Description:	 Mario Eliminamos las relaciones de stockproducto 
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
-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/04/13 
-- Description:	 PCP new 06 Henry Mejoras 07Plus 
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




insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000124,
	'KIT_STATUS',
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
	1000125,
	'KIT_STATUS',
	'INACTIVA',
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
	1000126,
	'KIT_STATUS',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);



ALTER TABLE public.socios_negocio ADD sn_codigo_direccion_facturacion varchar NULL;

ALTER TABLE public.productos ADD prod_is_kit varchar NULL DEFAULT 'N';

CREATE SEQUENCE seq_productos_kits START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.productos_kits (
	prodkit_productos_kits int4 NOT NULL DEFAULT nextval('seq_productos_kits'::regclass),
	prodkit_sku varchar NOT NULL,
	prodkit_nombre varchar NULL,
	prodkit_cantidad_componentes int4 NULL,
	prodkit_tipo varchar NULL,
	prodkit_cantidad float4 NULL,
	prodkit_cmm_estatus_id int4 NOT NULL,
	prodkit_usu_usuario_creado_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	prod_usu_usuario_modificado_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT productos_kits_pk PRIMARY KEY (prodkit_productos_kits),
	CONSTRAINT cmm_status_id FOREIGN KEY (prodkit_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id)
);

ALTER TABLE public.productos_kits RENAME COLUMN prodkit_productos_kits TO prodkit_productos_kits_id;
ALTER TABLE public.productos_kits RENAME COLUMN prod_usu_usuario_modificado_id TO prodkit_usu_usuario_modificado_id;

ALTER TABLE public.productos_kits ADD CONSTRAINT sku_relacion FOREIGN KEY (prodkit_sku) REFERENCES public.productos(prod_sku);


ALTER TABLE public.productos_kits ADD CONSTRAINT productos_kits_un UNIQUE (prodkit_sku);








CREATE SEQUENCE seq_productos_kits_componentes START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.productos_kits_componentes (
	prodkitcomp_productos_kits_componentes_id int4 NOT NULL DEFAULT nextval('seq_productos_kits_componentes'::regclass),
	prodkitcomp_sku varchar NULL,
	prodkitcomp_cantidad float4 NULL,
	prodkitcomp_num_componente int4 NULL,
	prodkitcomp_id_kit_padre int4 NULL,
	prodkitcomp_usu_usuario_creado_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	prodkitcomp_usu_usuario_modificado_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT productos_kits_componentes_pk PRIMARY KEY (prodkitcomp_productos_kits_componentes_id),
	CONSTRAINT productos_kits_componentes_fk FOREIGN KEY (prodkitcomp_id_kit_padre) REFERENCES public.productos_kits(prodkit_productos_kits_id)
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
	1000127,
	'FAQS_STATUS',
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
	1000128,
	'FAQS_STATUS',
	'INACTIVA',
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
	1000129,
	'FAQS_STATUS',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);






CREATE SEQUENCE seq_faqs_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.faqs (
	faqs_faqs_id int4 NOT NULL DEFAULT nextval('seq_faqs_id'::regclass),
	faqs_identificador varchar NULL,
	faqs_pregunta varchar NULL,
	faqs_respuesta varchar NULL,
	faqs_orden int4 NULL,
	faqs_cmm_estatus_id int4 NOT NULL,
	faqs_usu_usuario_creado_id int4 NOT NULL,
	"createdAt" timestamp(0) NULL,
	faqs_usu_usuario_modificado_id varchar NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT primary_key_id PRIMARY KEY (faqs_faqs_id)
);


ALTER TABLE public.usuarios ADD CONSTRAINT cod_vendedor UNIQUE (usu_codigo_vendedor);
ALTER TABLE public.socios_negocio ADD CONSTRAINT socios_negocio_fk FOREIGN KEY (sn_vendedor_codigo_sap) REFERENCES public.usuarios(usu_codigo_vendedor);




ALTER TABLE public.faqs ADD CONSTRAINT faqs_fk FOREIGN KEY (faqs_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id);


































































































































































































