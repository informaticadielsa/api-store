-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/11/05 
-- Description:	 categorias 
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


insert into  menus (mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt")
values ('Categorias', '/category', 1000004, 1, current_date);


insert into  menus (mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt")
values ('Productos', '/products', 1000004, 1, current_date);


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
    1000010,
    'ESTATUS_CATEGORIA',
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
    1000011,
    'ESTATUS_CATEGORIA',
    'INACTIVO',
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
    1000012,
    'ESTATUS_CATEGORIA',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);


CREATE SEQUENCE seq_cat_categoria_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.categorias
(
    cat_categoria_id INTEGER NOT NULL DEFAULT nextval('seq_cat_categoria_id'::regclass),
    cat_nombre character varying(50) NOT NULL,
    cat_descripcion character varying(100),
    cat_usu_usuario_creador_id integer NOT NULL,
    cat_cmm_estatus_id integer not null,
    "createdAt" timestamp NOT NULL,
    cat_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    cat_cat_categoria_padre_id integer check(cat_cat_categoria_padre_id <> cat_categoria_id and cat_cat_categoria_padre_id < cat_categoria_id),
    PRIMARY KEY (cat_categoria_id),
    CONSTRAINT usuario_creador_id FOREIGN KEY (cat_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usu_usuario_modificador_id FOREIGN KEY (cat_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT cmm_estatus_id FOREIGN KEY (cat_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples(cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.categorias
    OWNER to postgres;

    
CREATE INDEX fk_cat_categoria_padre_id ON categorias USING btree (cat_cat_categoria_padre_id);
ALTER TABLE ONLY categorias
    ADD CONSTRAINT ref_fk_cat_categoria_padre_id FOREIGN KEY (cat_cat_categoria_padre_id) REFERENCES categorias(cat_categoria_id);
COMMENT ON CONSTRAINT ref_fk_cat_categoria_padre_id ON categorias IS 'Categoría hija';



--Atributo Articulos
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
    1000013,
    'ESTATUS_ATRIBUTO',
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
    1000014,
    'ESTATUS_ATRIBUTO',
    'INACTIVO',
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
    1000015,
    'ESTATUS_ATRIBUTO',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);

CREATE SEQUENCE seq_at_atributo_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.atributos
(
    at_atributo_id  INTEGER NOT NULL DEFAULT nextval('seq_at_atributo_id'::regclass),
    at_nombre character varying(100) NOT NULL,
    at_descripcion character varying(150) NOT NULL,
    at_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    at_cmm_estatus_id integer NOT NULL,
    at_cat_categoria_id integer NOT NULL,
    at_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (at_atributo_id),
    CONSTRAINT usu_usuario_creador FOREIGN KEY (at_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usu_usuario_modificador FOREIGN KEY (at_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT cat_categoria FOREIGN KEY (at_cat_categoria_id)
        REFERENCES public.categorias (cat_categoria_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_atributo FOREIGN KEY (at_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.atributos
    OWNER to postgres;


--CREACIÓN DE PRODUCTOS
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
    1000016,
    'ESTATUS_PRODUCTO',
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
    1000017,
    'ESTATUS_PRODUCTO',
    'INACTIVO',
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
    1000018,
    'ESTATUS_PRODUCTO',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);


--CREACIONES DE PRODUCTOS Y RELACION DE CATEGORIAS DE VISUALIZACION
CREATE SEQUENCE seq_prod_producto_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
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
    PRIMARY KEY (prod_sku),
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

--CREAMOS EL INDEX PARA PRODUCTOS
CREATE INDEX fk_prod_prod_producto_padre_sku ON productos USING btree (prod_prod_producto_padre_sku);
ALTER TABLE ONLY productos
    ADD CONSTRAINT ref_fk_prod_prod_producto_padre_sku FOREIGN KEY (prod_prod_producto_padre_sku) REFERENCES productos(prod_sku);
COMMENT ON CONSTRAINT ref_fk_prod_prod_producto_padre_sku ON productos IS 'Producto hijo';

ALTER TABLE public.productos
    ADD CONSTRAINT "SKU_UNIQUE" UNIQUE (prod_sku);

--CATEGORIAS DE VISUALIZACIONES
CREATE SEQUENCE seq_ppc_previsualizacion_producto_categoria_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.previsualizacion_producto_categoria
(
    ppc_previsualizacion_producto_categoria_id INTEGER NOT NULL DEFAULT nextval('seq_ppc_previsualizacion_producto_categoria_id'::regclass),
    ppc_prod_sku character varying(150) NOT NULL,
    ppc_cat_categoria_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (ppc_previsualizacion_producto_categoria_id),
    CONSTRAINT producto_sku FOREIGN KEY (ppc_prod_sku)
        REFERENCES public.productos (prod_sku) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT categoria_id FOREIGN KEY (ppc_cat_categoria_id)
        REFERENCES public.categorias (cat_categoria_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.previsualizacion_producto_categoria
    OWNER to postgres;


-- Vendedor Admin
insert into roles (rol_nombre, rol_descripcion, rol_cmm_estatus, rol_usu_usuario_creado_por_id, "createdAt")
values ('Vendedor Admin', 'Vendedor admin, permite crear usuarios y gestión de usuarios', 1000007, 1, current_date);

insert into roles (rol_nombre, rol_descripcion, rol_cmm_estatus, rol_usu_usuario_creado_por_id, "createdAt")
values ('Vendedor', 'Vendedor junior permite visualicación de metas y equipo', 1000007, 1, current_date);

UPDATE 
     roles_permisos  
SET 
    rol_per_crear = false,
	rol_per_editar = false,
	rol_per_eliminar = false,
	rol_per_ver = false  
where rol_per_roles_permisos_id  = (
select rol_per_roles_permisos_id from roles_permisos rp2  
left join roles r ON r.rol_rol_id = rp2.rol_per_rol_rol_id 
left join menus m on m.mn_menu_id  = rp2.rol_per_mu_menu_id 
where r.rol_nombre = 'Vendedor Admin' and m.mn_nombre = 'Usuarios');