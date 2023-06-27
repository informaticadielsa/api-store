-- ============================================= 
-- Author:		Henry Mirhail Kishi Salinas 
-- Create date: 2021/03/09 
-- Description:	 Henry Atributos 
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





insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000087,
	'ATRIBUTO_PRODUCTO',
	'ACTIVA',
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
	1000088,
	'ATRIBUTO_PRODUCTO',
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
	1000089,
	'ATRIBUTO_PRODUCTO',
	'ELIMINADA',
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
	1000090,
	'ATRIBUTO_SKU_VALOR',
	'ACTIVA',
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
	1000091,
	'ATRIBUTO_SKU_VALOR',
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
	1000092,
	'ATRIBUTO_SKU_VALOR',
	'ELIMINADA',
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
	1000093,
	'ATRIBUTO_CATEGORIAS',
	'ACTIVA',
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
	1000094,
	'ATRIBUTO_CATEGORIAS',
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
	1000095,
	'ATRIBUTO_CATEGORIAS',
	'ELIMINADA',
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
	1000096,
	'ATRIBUTO_PRODUCTOS_VALOR',
	'ACTIVA',
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
	1000097,
	'ATRIBUTO_PRODUCTOS_VALOR',
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
	1000098,
	'ATRIBUTO_PRODUCTOS_VALOR',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);



















ALTER TABLE atributos DROP COLUMN at_cat_categoria_id;




CREATE SEQUENCE seq_atp_atributos_productos START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.atributos_productos (
	atp_atributo_producto_id int4 NOT NULL DEFAULT nextval('seq_atp_atributos_productos'::regclass),
	atp_id_atributo int4 NOT NULL,
	atp_id_producto int4 NOT NULL,
	atp_cmm_estatus_id int4 NOT NULL,
	atp_usu_usuario_creador_id int4 NOT NULL,
	"'createdAt'" timestamp(0) NOT NULL,
	atp_usu_usuario_modificador_id int4 NULL,
	"'updatedAt'" timestamp(0) NULL,
	CONSTRAINT atributos_productos_pk PRIMARY KEY (atp_atributo_producto_id),
	CONSTRAINT fk_at_atributo_id FOREIGN KEY (atp_id_atributo) REFERENCES public.atributos(at_atributo_id),
	CONSTRAINT fk_prod_producto_id FOREIGN KEY (atp_id_producto) REFERENCES public.productos(prod_producto_id),
	CONSTRAINT fk_cmm_control_id_estatus FOREIGN KEY (atp_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT fk_usuario_id_usu FOREIGN KEY (atp_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id)
);



ALTER TABLE public.atributos_productos RENAME COLUMN "'createdAt'" TO "createdAt";
ALTER TABLE public.atributos_productos RENAME COLUMN "'updatedAt'" TO "updatedAt";





CREATE SEQUENCE seq_atc_atributos_categorias START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.atributos_categorias (
	atc_atributos_categorias_id int4 NOT NULL DEFAULT nextval('seq_atc_atributos_categorias'::regclass),
	atc_id_atributo int4 NOT NULL,
	atc_id_categoria int4 NOT NULL,
	atc_cmm_estatus_id int4 NOT NULL,
	atc_usu_usuario_creador_id int4 NOT NULL,
	createdat timestamp(0) NOT NULL,
	atc_usu_usuario_modificador_id int4 NULL,
	updatedat timestamp(0) NULL,
	CONSTRAINT atributos_categorias_pk PRIMARY KEY (atc_atributos_categorias_id),
	CONSTRAINT atributo_id FOREIGN KEY (atc_id_atributo) REFERENCES public.atributos(at_atributo_id),
	CONSTRAINT categoria_id FOREIGN KEY (atc_id_categoria) REFERENCES public.categorias(cat_categoria_id),
	CONSTRAINT cmm_status FOREIGN KEY (atc_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT usu_usuario_creador FOREIGN KEY (atc_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id)
);



ALTER TABLE public.atributos_categorias RENAME COLUMN createdat TO "createdAt";
ALTER TABLE public.atributos_categorias RENAME COLUMN updatedat TO "updatedAt";






CREATE SEQUENCE seq_pav_productos_atributos_valores START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.productos_atributos_valores (
	pav_productos_atributos_valores_id int4 NOT NULL DEFAULT nextval('seq_pav_productos_atributos_valores'::regclass),
	pav_id_producto int4 NOT NULL,
	pav_atributo_categoria int4 NOT NULL,
	pav_valor varchar NOT NULL,
	pav_cmm_estatus_id int4 NOT NULL,
	pav_usu_usuario_creador_id int4 NOT NULL,
	createdat timestamp(0) NOT NULL,
	pav_usu_usuario_modificador_id int4 NULL,
	updatedat timestamp(0) NULL,
	CONSTRAINT productos_atributos_valores_pk PRIMARY KEY ("pav_productos_atributos_valores_id"),
	CONSTRAINT producto_id FOREIGN KEY (pav_id_producto) REFERENCES public.productos(prod_producto_id),
	CONSTRAINT atributos_categoria_id FOREIGN KEY (pav_atributo_categoria) REFERENCES public.atributos_categorias(atc_atributos_categorias_id),
	CONSTRAINT cmm_status_id FOREIGN KEY (pav_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT productos_atributos_valores_fk_2 FOREIGN KEY (pav_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id)
);


ALTER TABLE public.productos_atributos_valores RENAME COLUMN createdat TO "createdAt";
ALTER TABLE public.productos_atributos_valores RENAME COLUMN updatedat TO "updatedAt";







CREATE SEQUENCE seq_skuav_sku_atributos_valores_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.sku_atributos_valores (
	skuav_sku_atributos_valores_id int4 NOT NULL DEFAULT nextval('seq_skuav_sku_atributos_valores_id'::regclass),
	skuav_id_sku int4 NOT NULL,
	skuav_id_atributo_producto int4 NOT NULL,
	skuav_valor varchar NOT NULL,
	skuav_cmm_estatus_id int4 NOT NULL,
	skuav_usu_usuario_creador_id int4 NOT NULL,
	createdat timestamp(0) NOT NULL,
	skuav_usu_usuario_modificador_id int4 NULL,
	updatedat timestamp(0) NULL,
	CONSTRAINT sku_atributos_valores_pk PRIMARY KEY (skuav_sku_atributos_valores_id),
	CONSTRAINT id_producto FOREIGN KEY (skuav_id_sku) REFERENCES public.productos(prod_producto_id),
	CONSTRAINT id_atributo_producto FOREIGN KEY (skuav_id_atributo_producto) REFERENCES public.atributos_productos(atp_atributo_producto_id),
	CONSTRAINT cmm_estatud_id FOREIGN KEY (skuav_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT sku_atributos_valores_fk_3 FOREIGN KEY (skuav_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id)
);

ALTER TABLE public.sku_atributos_valores RENAME COLUMN createdat TO "createdAt";
ALTER TABLE public.sku_atributos_valores RENAME COLUMN updatedat TO "updatedAt";



































































