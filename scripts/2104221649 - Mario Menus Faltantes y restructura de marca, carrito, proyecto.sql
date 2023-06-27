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
-- Author:		Hernán Gómez 
-- Create date: 2021/04/22 
-- Description:	 Mario Menus Faltantes 
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

insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
	mn_tipo_menu_id
)
values(
	'Categorias',
	'/category',
	1000004,
	1,
	current_date,
	1000054
);

insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
	mn_tipo_menu_id
)
values(
	'Productos',
	'/products',
	1000004,
	1,
	current_date,
	1000054
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
	mn_tipo_menu_id
)
values(
	'Atributos',
	'/attributes',
	1000004,
	1,
	current_date,
	1000054
);



----------------------------   Marcas Reglas ------------------------------
ALTER TABLE public.marcas
    ADD COLUMN mar_limitante boolean NOT NULL DEFAULT false;
 
ALTER TABLE public.marcas
    ADD COLUMN mar_importe double precision;

ALTER TABLE public.marcas
    ADD COLUMN mar_propiedades_extras boolean NOT NULL DEFAULT false;

ALTER TABLE public.marcas
    ADD COLUMN mar_cantidad_producto integer;

---- Roles, nueva propiedad
ALTER TABLE public.roles
    ADD COLUMN rol_permiso_especial boolean NOT NULL DEFAULT false;


------------------------------ RESTRUCTURA CARRITO DE COMPRAS --------------------------

drop table carrito_de_compras;

CREATE SEQUENCE seq_cdc_carrito_de_compra_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.carrito_de_compras
(
    cdc_carrito_de_compra_id integer NOT NULL DEFAULT nextval('seq_cdc_carrito_de_compra_id'::regclass),
    cdc_numero_orden character varying NOT NULL,
    cdc_usu_usuario_vendedor_id integer,
    cdc_sn_socio_de_negocio_id integer,
    cdc_descuento_extra integer,
    cdc_total_carrito double precision,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
	cdc_lista_precio integer,
	cdc_project_candidate boolean not null DEFAULT false,
	cdc_from_project boolean not null DEFAULT false,
    PRIMARY KEY (cdc_carrito_de_compra_id),
    CONSTRAINT carrito_unico UNIQUE (cdc_sn_socio_de_negocio_id),
    CONSTRAINT usuario_vendedor_id FOREIGN KEY (cdc_usu_usuario_vendedor_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT socio_de_negocio_id FOREIGN KEY (cdc_sn_socio_de_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT lista_de_precio FOREIGN KEY (cdc_lista_precio)
        REFERENCES public.listas_de_precios (listp_lista_de_precio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.carrito_de_compras
    OWNER to postgres;

	-------------- Productos de carrito de compras ------- 

CREATE SEQUENCE seq_pcdc_producto_carrito_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_carrito_de_compra
(
    pcdc_producto_carrito_id  integer NOT NULL DEFAULT nextval('seq_pcdc_producto_carrito_id'::regclass),
    pcdc_carrito_de_compra_id integer NOT NULL,
    pcdc_prod_producto_id integer NOT NULL,
	pcdc_producto_cantidad integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    pcdc_mejor_descuento jsonb,
	pcdc_lista_precio boolean,
    PRIMARY KEY (pcdc_producto_carrito_id),
    CONSTRAINT producto_id_carrito_id_unico UNIQUE (pcdc_carrito_de_compra_id, pcdc_prod_producto_id),
    CONSTRAINT carrito_de_compra_id FOREIGN KEY (pcdc_carrito_de_compra_id)
        REFERENCES public.carrito_de_compras (cdc_carrito_de_compra_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (pcdc_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.productos_carrito_de_compra
    OWNER to postgres;


---- Eliminamos campos no necesarios de la tabla de productos cotizaciones ----

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_descuento_producto;

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_prod_precio;

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_usu_usuario_modificado_por_id;

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_usu_usuario_creador_id;

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_estatus_producto_cotizacion_id;

ALTER TABLE public.productos_cotizaciones DROP COLUMN pc_usu_usuario_vendedor_id;

ALTER TABLE public.productos_cotizaciones
    ADD COLUMN pc_descuento_maximo jsonb;


ALTER TABLE public.cotizaciones_proyectos DROP COLUMN cot_usu_usuario_creador_id;

ALTER TABLE public.cotizaciones_proyectos DROP COLUMN cot_descuento_extra;

ALTER TABLE public.productos_cotizaciones
    RENAME pc_descuento_maximo TO pc_mejor_descuento;

ALTER TABLE public.cotizaciones_proyectos
    ADD CONSTRAINT numero_de_orden_unico UNIQUE (cot_numero_orden);


---Editicion Colecciones 

CREATE SEQUENCE seq_prodcol_producto_coleccion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_colecciones
(
    prodcol_producto_coleccion_id INTEGER NOT NULL DEFAULT nextval('seq_prodcol_producto_coleccion_id'::regclass),
    prodcol_col_coleccion_id integer NOT NULL,
    prodcol_prod_producto_id integer not null,
    "createdAt" timestamp NOT null,
    "updatedAt" timestamp,
    PRIMARY KEY (prodcol_producto_coleccion_id),
    CONSTRAINT coleccion_producto_unica UNIQUE (prodcol_col_coleccion_id, prodcol_prod_producto_id),
    CONSTRAINT coleccion_id FOREIGN KEY (prodcol_col_coleccion_id)
        REFERENCES public.colecciones (col_coleccion_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (prodcol_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.productos_colecciones
    OWNER to postgres;


