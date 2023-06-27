-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/01/04 
-- Description:	 promociones 
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
CREATE SEQUENCE seq_promdes_promocion_descuento_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.promociones_descuentos
(
    promdes_promocion_descuento_id integer NOT NULL DEFAULT nextval('seq_promdes_promocion_descuento_id'::regclass),
    promdes_nombre character varying(250) NOT NULL,
    promdes_descripcion character varying(500),
    promdes_estatus_id integer NOT NULL,
    promdes_fecha_inicio_validez date NOT NULL,
    promdes_fecha_finalizacion_validez date NOT NULL,
    promdes_tipo_descuento_id integer NOT NULL,
    promdes_descuento_exacto double precision NOT NULL,
    promdes_valor_minimo_pedido double precision NOT NULL,
    promdes_usu_usuario_creado_id integer NOT NULL,
    "createdAt" timestamp NULL,
    promdes_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (promdes_promocion_descuento_id),
    CONSTRAINT creador_por FOREIGN KEY (promdes_usu_usuario_creado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT modificado_por FOREIGN KEY (promdes_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estado_promocion FOREIGN KEY (promdes_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT tipo_descuento_id FOREIGN KEY (promdes_tipo_descuento_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.promociones_descuentos
    OWNER to postgres;


CREATE SEQUENCE seq_ep_elemento_promocion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.elementos_promocion
(
    ep_elemento_promocion_id integer NOT NULL DEFAULT nextval('seq_ep_elemento_promocion_id'::regclass),
    ep_promdes_promocion_descuento_id integer NOT NULL,
    ep_cat_categoria_id integer,
    ep_mar_marca_id integer,
    ep_col_coleleccion_id integer,
    ep_prod_producto_id integer,
    ep_sn_socios_negocio_id integer,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (ep_elemento_promocion_id),
    CONSTRAINT promocion_categoria UNIQUE (ep_promdes_promocion_descuento_id, ep_cat_categoria_id),
    CONSTRAINT promocion_marca UNIQUE (ep_promdes_promocion_descuento_id, ep_mar_marca_id),
    CONSTRAINT promocion_coleccion UNIQUE (ep_promdes_promocion_descuento_id, ep_col_coleleccion_id),
    CONSTRAINT promocion_producto UNIQUE (ep_promdes_promocion_descuento_id, ep_prod_producto_id),
    CONSTRAINT promocion_socio_negocio UNIQUE (ep_promdes_promocion_descuento_id, ep_sn_socios_negocio_id),
    CONSTRAINT categoria_id FOREIGN KEY (ep_cat_categoria_id)
        REFERENCES public.categorias (cat_categoria_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT marca_id FOREIGN KEY (ep_mar_marca_id)
        REFERENCES public.marcas (mar_marca_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT coleccion_id FOREIGN KEY (ep_col_coleleccion_id)
        REFERENCES public.colecciones (col_coleccion_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (ep_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT promocion_id FOREIGN KEY (ep_promdes_promocion_descuento_id)
        REFERENCES public.promociones_descuentos (promdes_promocion_descuento_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT socio_de_negocio FOREIGN KEY (ep_sn_socios_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
         ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.elementos_promocion
    OWNER to postgres;


--ESTATUS DE PROMOCION
insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000059,
	'ESTATUS_PROMOCION',
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
	1000060,
	'ESTATUS_PROMOCION',
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
	1000061,
	'ESTATUS_PROMOCION',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);


---TIPO DE PROMOCION
insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000062,
	'TIPO_PROMOCION',
	'Fix Ammount',
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
	1000063,
	'TIPO_PROMOCION',
	'Percentage',
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
	1000064,
	'TIPO_PROMOCION',
	'SKU',
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
	1000065,
	'TIPO_PROMOCION',
	'Gift',
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
	1000066,
	'TIPO_PROMOCION',
	'Free Shipping',
	true,
	true,
	1,
	current_date
);



insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt"
)
values
(
	'Cotizacion y/o compras',
	'/quotes',
	1000004,
	1,
	current_date
);



insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt"
)
values
(
	'Promociones',
	'/promotions',
	1000004,
	1,
	current_date
);


