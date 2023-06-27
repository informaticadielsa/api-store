-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/05/03 
-- Description:	 Mario Checkout y carrito de compras 
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
---Evaluamos si ya se aplico un cupón al carrito
ALTER TABLE public.carrito_de_compras
    ADD COLUMN cdc_with_coupon boolean NOT NULL DEFAULT false;

---Establecemos que los cupones no son repetibles
ALTER TABLE public.promociones_descuentos
    ADD CONSTRAINT cupon_unico UNIQUE (promdes_cupon_descuento);


--- Eliminamos campos inecesarios en la tabla de compra finalizada
ALTER TABLE public.productos_de_compra_finalizada DROP COLUMN pcf_usu_usuario_agregado_por_id;
ALTER TABLE public.productos_de_compra_finalizada DROP COLUMN pcf_precio_unitario;


--------------------------------------- RESTRUCTURA EQUIPO DE TRABAJO -----------------------------------------
---Eliminamos la tabla de relación equipo de trabajo
drop table usuarios_equipo_de_trabajo ; 
--Creamos la nueva tabla de equipos de trabajo. 
CREATE SEQUENCE seq_uedt_usuario_equipo_de_trabajo_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.usuarios_equipo_de_trabajo
(
    uedt_usuario_equipo_de_trabajo_id integer NOT NULL DEFAULT nextval('seq_uedt_usuario_equipo_de_trabajo_id'::regclass),
    uedt_et_equipo_de_trabajo_id integer NOT NULL,
    uedt_usu_usuario_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (uedt_usuario_equipo_de_trabajo_id)
);

ALTER TABLE public.usuarios_equipo_de_trabajo
    OWNER to postgres;


--Agregamos la columna que define quien es el propietarío del equipo de trabajo
ALTER TABLE public.equipos_de_trabajo
    ADD COLUMN et_usu_usuario_gerente_id integer;
ALTER TABLE public.equipos_de_trabajo
    ADD CONSTRAINT usuario_gerente_id FOREIGN KEY (et_usu_usuario_gerente_id)
    REFERENCES public.usuarios (usu_usuario_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


-------------------------------------- CREACION DE TABLA PARA ARCHIVOS HOME -----------------------------------------------
CREATE SEQUENCE seq_adi_archivo_de_inicio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.archivos_de_inicio
(
    adi_archivo_de_inicio_id integer NOT NULL DEFAULT nextval('seq_adi_archivo_de_inicio_id'::regclass),
    adi_nombre_archivo character varying(60) NOT NULL,
    adi_ruta_archivo character varying(500) NOT NULL,
    adi_titulo character varying(500),
    adi_descripcion character varying(1000),
    adi_url character varying(2000),
    adi_cmm_tipo_id integer NOT NULL,
    adi_cmm_estatus_id integer NOT NULL,
    adi_usu_usuario_creador_id integer NOT NULL,
    adi_usu_usuario_modificador_id integer,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (adi_archivo_de_inicio_id),
    CONSTRAINT tipo_archivo FOREIGN KEY (adi_cmm_tipo_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_archivo FOREIGN KEY (adi_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_id FOREIGN KEY (adi_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador_id FOREIGN KEY (adi_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.archivos_de_inicio
    OWNER to postgres;

----------- ESTATUS ARCHIVO MAIN --------------------------------------------

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
    1000141,
    'ESTATUS_ARCHIVO_MAIN',
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
    1000142,
    'ESTATUS_ARCHIVO_MAIN',
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
    1000143,
    'ESTATUS_ARCHIVO_MAIN',
    'ELIMINADO',
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
    1000144,
    'TIPO_ARCHIVO_MAIN',
    'MAIN_SLIDER',
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
    1000145,
    'TIPO_ARCHIVO_MAIN',
    'MAIN_BANNER_TOP',
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
    1000146,
    'TIPO_ARCHIVO_MAIN',
    'MAIN_BANNER_BOTTOM',
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
    1000147,
    'TIPO_ARCHIVO_MAIN',
    'MAIN_ICONS',
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
    1000148,
    'TIPO_ARCHIVO_MAIN',
    'SECONDARY_BANNERS_TOP',
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
    1000149,
    'TIPO_ARCHIVO_MAIN',
    'SECONDARY_BANNERS_BOTTOM',
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
    1000150,
    'TIPO_ARCHIVO_MAIN',
    'LOGO_HOME',
    TRUE,
    TRUE,
    1,
    current_date
);