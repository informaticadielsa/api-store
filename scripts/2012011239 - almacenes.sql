-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2020/12/01 
-- Description:	 almacenes 
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
    1000036,
    'ESTATUS_ALMACENES',
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
    1000037,
    'ESTATUS_ALMACENES',
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
    1000038,
    'ESTATUS_ALMACENES',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);




CREATE SEQUENCE seq_alm_almacen_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.almacenes (
    alm_almacen_id integer NOT NULL DEFAULT nextval('seq_et_equipo_trabajo_id'::regclass),
    alm_nombre character varying(150) NOT NULL,
    alm_codigo_postal integer NOT NULL,
    alm_estado character varying(50) NOT NULL,
    alm_direccion character varying(100),
    alm_cmm_estatus_id integer NOT NULL,
    alm_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    alm_usu_usuario_modificado_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (alm_almacen_id),

    CONSTRAINT usuario_creador FOREIGN KEY (alm_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador FOREIGN KEY (alm_usu_usuario_modificado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_equipo_trabajo FOREIGN KEY (alm_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.almacenes OWNER TO postgres;
