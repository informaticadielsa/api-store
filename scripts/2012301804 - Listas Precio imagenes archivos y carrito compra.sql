-- ============================================= 
-- Author:		Hernán Gómez
-- Create date: 2020/12/30 
-- Description:	 Listas Precio imagenes archivos y carrito compra 
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
drop table producto_precios;

ALTER TABLE public.productos
    ADD COLUMN prod_precio double precision NOT NULL DEFAULT 0.00;

insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000056,
	'TIPO_ROL_MENU',
	'VENDEDORES',
	true,
	true,
	1,
	current_date
);

ALTER TABLE public.listas_de_precios
    ADD COLUMN listp_tipo_precio integer NOT NULL DEFAULT 1;

    

ALTER TABLE listas_de_precios ADD CONSTRAINT fk_tipo_precios
FOREIGN KEY (listp_tipo_precio) REFERENCES controles_maestros_multiples(cmm_control_id);


--Imagenes de producto 
CREATE SEQUENCE seq_imgprod_imagen_producto_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.imagenes_producto
(
    imgprod_imagen_producto_id integer NOT NULL DEFAULT nextval('seq_imgprod_imagen_producto_id'::regclass),
    imgprod_prod_producto_id integer NOT NULL,
    imgprod_nombre_archivo character varying(100) NOT NULL,
    imgprod_ruta_archivo character varying(1000) NOT NULL,
    imgprod_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (imgprod_imagen_producto_id),
    CONSTRAINT producto_id FOREIGN KEY (imgprod_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador FOREIGN KEY (imgprod_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.imagenes_producto
    OWNER to postgres;



--Carrito de compras
CREATE SEQUENCE seq_carcop_carrito_compra_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.carrito_de_compras
(
	carcop_carrito_compra_id integer NOT NULL DEFAULT nextval('seq_carcop_carrito_compra_id'::regclass),
    carcop_numero_orden character varying(100) NOT NULL,
    carcop_sn_socios_negocio_id integer NOT NULL,
    carcop_prod_producto_id integer NOT NULL,
    carcop_usu_usuario_vendedor_id integer NOT NULL,
    carcop_cantidad integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (carcop_carrito_compra_id),
    CONSTRAINT socio_de_negocio_id FOREIGN KEY (carcop_sn_socios_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (carcop_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT vendedor_id FOREIGN KEY (carcop_usu_usuario_vendedor_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.carrito_de_compras
    OWNER to postgres;

    
ALTER TABLE public.carrito_de_compras 
    ADD CONSTRAINT productos_unicos UNIQUE (carcop_numero_orden, carcop_sn_socios_negocio_id, carcop_prod_producto_id, carcop_usu_usuario_vendedor_id);