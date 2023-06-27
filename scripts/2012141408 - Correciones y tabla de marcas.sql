-- ============================================= 
-- Author:		hernán gómez 
-- Create date: 2020/12/14 
-- Description:	 Correciones y tabla de marcas 
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

insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt"
)
values 
(
	'Marcas',
	'/marcas',
	1000004,
	1,
	current_date
);

CREATE SEQUENCE seq_mar_marca_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.marcas
(
    mar_marca_id integer NOT NULL DEFAULT nextval('seq_mar_marca_id'::regclass),
    mar_nombre character varying(150) NOT NULL,
    mar_abreviatura character varying(50) NOT NULL,
    mar_descripcion character varying(500) NOT NULL,
    mar_cmm_estatus_id integer not null,
    mar_usu_usuario_creado_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    mar_usu_usuario_modificado_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (mar_marca_id),
    CONSTRAINT usuario_creador_id FOREIGN KEY (mar_usu_usuario_creado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador_id FOREIGN KEY (mar_usu_usuario_modificado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_marca FOREIGN KEY (mar_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.marcas
    OWNER to postgres;


    
insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000042,
	'ESTATUS_MARCAS',
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
	1000043,
	'ESTATUS_MARCAS',
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
	1000044,
	'ESTATUS_MARCAS',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);



ALTER TABLE public.productos
    ADD COLUMN prod_mar_marca_id integer;
   
  
ALTER TABLE productos ADD CONSTRAINT fk_marca
FOREIGN KEY (prod_mar_marca_id) REFERENCES marcas(mar_marca_id);