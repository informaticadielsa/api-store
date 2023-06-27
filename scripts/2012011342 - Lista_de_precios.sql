-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/12/01 
-- Description:	 Lista_de_precios 
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
----- ESTATUS DE LISTA DE PRECIOS -------

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
    1000039,
    'ESTATUS_LISTA_DE_PRECIO',
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
    1000040,
    'ESTATUS_LISTA_DE_PRECIO',
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
    1000041,
    'ESTATUS_LISTA_DE_PRECIO',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);



----------------- Tabla de lista de precios --------------------------------------------------------------
CREATE SEQUENCE seq_listp_lista_de_precio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.listas_de_precios
(
    listp_lista_de_precio_id INTEGER NOT NULL DEFAULT nextval('seq_listp_lista_de_precio_id'::regclass),
    listp_nombre character varying(100) NOT NULL,
    listp_descripcion character varying(500) NOT NULL,
    listp_cmm_estatus_id integer NOT NULL,
    listp_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    listp_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (listp_lista_de_precio_id),
    CONSTRAINT estatus_lista_de_precio FOREIGN KEY (listp_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_id FOREIGN KEY (listp_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador_id FOREIGN KEY (listp_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.listas_de_precios
    OWNER to postgres;



---------------------------  TIPOS DE PRECIO --------------------------------------------------


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
    1,
    'TIPO_PRECIO',
    'LISTA',
    false,
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
    2,
    'TIPO_PRECIO',
    'AGOTAR EXISTENCIAS',
    false,
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
    3,
    'TIPO_PRECIO',
    'REMATE',
    false,
    TRUE,
    1,
    current_date
);


------------------------------ PRECIOS ------------------------------------------------
CREATE TABLE public.producto_precios
(
    prodpre_prod_producto_id integer NOT NULL,
    prodpre_precio integer NOT NULL,
    prodpre_cmm_tipo_precio_id integer NOT NULL,
    prodpre_usu_creador_id integer not null,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    CONSTRAINT lista_producto_tipo UNIQUE (prodpre_prod_producto_id),
    CONSTRAINT producto_id FOREIGN KEY (prodpre_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT tipo_precio FOREIGN KEY (prodpre_cmm_tipo_precio_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_id FOREIGN KEY (prodpre_usu_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.producto_precios
    OWNER to postgres;



-----------------------------------------  STOCK PRODUCTOS -----------------------------------
CREATE SEQUENCE seq_sp_stock_producto_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.stocks_productos
(
    sp_stock_producto_id  INTEGER NOT NULL DEFAULT nextval('seq_sp_stock_producto_id'::regclass),
    sp_prod_producto_id integer NOT NULL,
    sp_fecha_ingreso timestamp NOT NULL,
    sp_cantidad integer not null,
    sp_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (sp_stock_producto_id),
    CONSTRAINT producto_id FOREIGN KEY (sp_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador FOREIGN KEY (sp_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.stocks_productos
    OWNER to postgres;


