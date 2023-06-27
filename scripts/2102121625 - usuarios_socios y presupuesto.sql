-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/02/12 
-- Description:	 Mario usuarios_socios y presupuesto 
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

--Creamos la relación entre socios_negcios_usuario y su status de usuario
ALTER TABLE socios_negocio_usuario ADD CONSTRAINT fk_estatus_usuario_id
FOREIGN KEY (snu_cmm_estatus_id) REFERENCES controles_maestros_multiples(cmm_control_id);


--- Cotizaciones 
CREATE SEQUENCE seq_cot_cotizacion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.cotizaciones_proyectos
(
    cot_cotizacion_id integer NOT NULL DEFAULT nextval('seq_cot_cotizacion_id'::regclass),
    cot_numero_orden character varying(500) NOT NULL,
    cot_proyecto_nombre character varying(100),
    cot_cmm_tipo_id integer NOT NULL,
    cot_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    cot_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    cot_cmm_estatus_id integer NOT NULL,
    cot_sn_socios_negocio_id integer NOT NULL,
    cot_usu_usuario_vendedor_id integer NOT NULL,
	cot_fecha_vencimiento date NOT NULL,
    PRIMARY KEY (cot_cotizacion_id),
    CONSTRAINT tipo_cmm_id FOREIGN KEY (cot_cmm_tipo_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_orden_id FOREIGN KEY (cot_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificado_orden_id FOREIGN KEY (cot_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_cmm_id FOREIGN KEY (cot_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_socio_negocio_usuario FOREIGN KEY (cot_sn_socios_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_vendedor_id FOREIGN KEY (cot_usu_usuario_vendedor_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.cotizaciones_proyectos
    OWNER to postgres;


--Productos de cotización
CREATE SEQUENCE seq_pc_producto_cotizacion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_cotizaciones
(
    pc_producto_cotizacion_id integer NOT NULL DEFAULT nextval('seq_pc_producto_cotizacion_id'::regclass),
    pc_cot_cotizacion_id integer NOT NULL,
    pc_prod_producto_id integer NOT NULL,
    pc_usu_usuario_vendedor_id integer NOT NULL,
    pc_estatus_producto_cotizacion_id integer NOT NULL,
    pc_usu_usuario_creador_id integer NOT NULL,
    pc_usu_usuario_modificado_por_id integer,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
	pc_prod_precio double precision NOT NULL DEFAULT 0.00,
    PRIMARY KEY (pc_producto_cotizacion_id),
    CONSTRAINT cotizacion_id FOREIGN KEY (pc_cot_cotizacion_id)
        REFERENCES public.cotizaciones_proyectos (cot_cotizacion_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (pc_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT vendido_por_id FOREIGN KEY (pc_usu_usuario_vendedor_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_producto_id FOREIGN KEY (pc_estatus_producto_cotizacion_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_id FOREIGN KEY (pc_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificado_id FOREIGN KEY (pc_usu_usuario_modificado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.productos_cotizaciones
    OWNER to postgres;


ALTER TABLE public.productos_cotizaciones
    ADD CONSTRAINT productos_no_repetidos UNIQUE (pc_cot_cotizacion_id, pc_prod_producto_id);

--ESTATUS DE COTIZACIONES 
insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000076,
	'TIPO_COTIZACION_PROYECTO',
	'COTIZACION',
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
	1000077,
	'TIPO_COTIZACION_PROYECTO',
	'PROYECTO',
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
	1000078,
	'ESTATUS_COTIZACION_PROYECTO',
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
	1000079,
	'ESTATUS_COTIZACION_PROYECTO',
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
	1000080,
	'ESTATUS_COTIZACION_PROYECTO',
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
	1000081,
	'ESTUS_PRODUCTO_COTIZACION',
	'APROBADO',
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
	1000082,
	'ESTUS_PRODUCTO_COTIZACION',
	'PENDIENTE',
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
	1000083,
	'ESTUS_PRODUCTO_COTIZACION',
	'DECLINADO',
	true,
	true,
	1,
	current_date
);