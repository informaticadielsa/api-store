-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/11/25 
-- Description:	 ChangeProducto 
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
drop table previsualizacion_producto_categoria;

drop table productos ;

CREATE TABLE public.productos
(
    prod_producto_id INTEGER NOT NULL DEFAULT nextval('seq_prod_producto_id'::regclass),
    prod_sku character varying(150) NOT NULL UNIQUE,
    prod_nombre character varying(150) NOT NULL,
    prod_descripcion character varying(800) NOT NULL,
    prod_cat_categoria_id integer NOT NULL,
    prod_usu_usuario_creado_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    prod_usu_usuario_modificado_id integer,
    "updatedAt" timestamp,
    prod_cmm_estatus_id integer NOT NULL,
    prod_prod_producto_padre_sku  character varying(150)  check(prod_prod_producto_padre_sku <> prod_sku),
    PRIMARY KEY (prod_producto_id),
    CONSTRAINT categoria_id FOREIGN KEY (prod_cat_categoria_id)
        REFERENCES public.categorias (cat_categoria_id ) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_id FOREIGN KEY (prod_usu_usuario_creado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador_id FOREIGN KEY (prod_usu_usuario_modificado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_cmm_id FOREIGN KEY (prod_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.productos
    OWNER to postgres;

CREATE INDEX fk_prod_prod_producto_padre_sku ON productos USING btree (prod_prod_producto_padre_sku);
ALTER TABLE ONLY productos
    ADD CONSTRAINT ref_fk_prod_prod_producto_padre_sku FOREIGN KEY (prod_prod_producto_padre_sku) REFERENCES productos(prod_sku);
COMMENT ON CONSTRAINT ref_fk_prod_prod_producto_padre_sku ON productos IS 'Producto hijo';

ALTER TABLE public.productos
    ADD CONSTRAINT "SKU_UNIQUE" UNIQUE (prod_sku);

CREATE TABLE public.previsualizacion_productos_categorias
(
    ppc_previsualizacion_producto_categoria_id INTEGER NOT NULL DEFAULT nextval('seq_ppc_previsualizacion_producto_categoria_id'::regclass),
    ppc_prod_producto_id INTEGER NOT NULL,
    ppc_cat_categoria_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (ppc_previsualizacion_producto_categoria_id),
    CONSTRAINT producto_id FOREIGN KEY (ppc_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT categoria_id FOREIGN KEY (ppc_cat_categoria_id)
        REFERENCES public.categorias (cat_categoria_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.previsualizacion_productos_categorias
    OWNER to postgres;