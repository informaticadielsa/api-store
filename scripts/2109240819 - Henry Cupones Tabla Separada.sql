-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/09/24 
-- Description:	 Henry Cupones Tabla Separada 
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




CREATE SEQUENCE seq_promcup_promociones_cupones_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.promociones_cupones (
	promcup_promociones_cupones_id int4 NOT NULL DEFAULT nextval('seq_promcup_promociones_cupones_id'::regclass),
	promcup_nombre varchar NOT NULL,
	promcup_descripcion varchar NULL,
	promcup_estatus_id int4 NOT NULL,
	promcup_fecha_inicio_validez date NOT NULL,
	promcup_fecha_finalizacion_validez date NOT NULL,
	promcup_tipo_descuento_id int4 NULL,
	promcup_descuento_exacto float8 NULL,
	promcup_valor_minimo_pedido float8 NOT NULL,
	promcup_usu_usuario_creado_id int4 NOT NULL,
	"createdAt" timestamp NULL,
	promcup_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp NULL,
	promcup_cupon_codigo varchar NULL,
	CONSTRAINT promociones_cupones_pk PRIMARY KEY (promcup_promociones_cupones_id),
	CONSTRAINT promociones_cupones_un UNIQUE (promcup_cupon_codigo),
	CONSTRAINT creado_por FOREIGN KEY (promcup_usu_usuario_creado_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT cmm_status FOREIGN KEY (promcup_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT modificado_por FOREIGN KEY (promcup_usu_usuario_modificador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT tipo_descuento FOREIGN KEY (promcup_tipo_descuento_id) REFERENCES public.controles_maestros_multiples(cmm_control_id)
);

ALTER TABLE public.promociones_cupones ALTER COLUMN promcup_valor_minimo_pedido DROP NOT NULL;


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
    1000169,
    'ESTATUS_CUPONES',
    'ACTIVO',
    TRUE,
    TRUE,
    1,
    current_date
);


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
    1000170,
    'ESTATUS_CUPONES',
    'INACTIVA',
    TRUE,
    TRUE,
    1,
    current_date
);


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
    1000171,
    'ESTATUS_CUPONES',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);
























CREATE SEQUENCE seq_ec_elemento_promocion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.elementos_cupones (
	ec_elemento_promocion_id int4 NOT NULL DEFAULT nextval('seq_ec_elemento_promocion_id'::regclass),
	ec_promdes_promocion_descuento_id int4 NOT NULL,
	ec_cat_categoria_id int4 NULL,
	ec_mar_marca_id int4 NULL,
	ec_sn_socios_negocio_id int4 NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL,
	ec_prod_producto_id int4 NULL,
	CONSTRAINT elementos_cupones_pk PRIMARY KEY (ec_elemento_promocion_id),
	CONSTRAINT promocion_cupon_id FOREIGN KEY (ec_promdes_promocion_descuento_id) REFERENCES public.promociones_cupones(promcup_promociones_cupones_id),
	CONSTRAINT categoria_id FOREIGN KEY (ec_cat_categoria_id) REFERENCES public.categorias(cat_categoria_id),
	CONSTRAINT marcas_id FOREIGN KEY (ec_mar_marca_id) REFERENCES public.marcas(mar_marca_id),
	CONSTRAINT socio_de_negocio_id FOREIGN KEY (ec_sn_socios_negocio_id) REFERENCES public.socios_negocio(sn_socios_negocio_id),
	CONSTRAINT elementos_cupones_fk_3 FOREIGN KEY (ec_prod_producto_id) REFERENCES public.productos(prod_producto_id)
);

ALTER TABLE public.elementos_cupones RENAME COLUMN ec_elemento_promocion_id TO ec_elemento_cupones_id;
ALTER TABLE public.elementos_cupones RENAME COLUMN ec_promdes_promocion_descuento_id TO ec_promcup_promociones_cupones_id;



















CREATE SEQUENCE seq_prodcup_producto_cupones_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.productos_cupones (
	prodcup_producto_cupones_id int4 NOT NULL DEFAULT nextval('seq_prodcup_producto_cupones_id'::regclass),
	prodcup_promcup_promociones_cupones_id int4 NOT NULL,
	prodcup_prod_producto_id int4 NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT productos_cupones_pk PRIMARY KEY (prodcup_producto_cupones_id),
	CONSTRAINT promocion_id FOREIGN KEY (prodcup_promcup_promociones_cupones_id) REFERENCES public.promociones_cupones(promcup_promociones_cupones_id),
	CONSTRAINT producto_id FOREIGN KEY (prodcup_prod_producto_id) REFERENCES public.productos(prod_producto_id)
);






ALTER TABLE public.promociones_cupones DROP CONSTRAINT promociones_cupones_un;


ALTER TABLE public.promociones_descuentos ADD promdes_prioridad int4 NULL;
ALTER TABLE public.promociones_cupones ADD promcup_prioridad int4 NULL;






ALTER TABLE public.promociones_descuentos ALTER COLUMN promdes_valor_minimo_pedido DROP NOT NULL;








