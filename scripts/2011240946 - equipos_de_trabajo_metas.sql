-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/11/24 
-- Description:	 equipos_de_trabajo_metas 
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
    1000019,
    'ESTATUS_EQUIPO_DE_TRABAJO',
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
    1000020,
    'ESTATUS_EQUIPO_DE_TRABAJO',
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
    1000021,
    'ESTATUS_EQUIPO_DE_TRABAJO',
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
    1000022,
    'ESTATUS_USUARIO_EQUIPO_TRABAJO',
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
    1000023,
    'ESTATUS_USUARIO_EQUIPO_TRABAJO',
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
    1000024,
    'ESTATUS_USUARIO_EQUIPO_TRABAJO',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);


CREATE SEQUENCE seq_et_equipo_trabajo_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.equipos_de_trabajo
(
    et_equipo_trabajo_id INTEGER NOT NULL DEFAULT nextval('seq_et_equipo_trabajo_id'::regclass),
    et_nombre character varying(100) NOT NULL,
    et_descripcion character varying(500) NOT NULL,
    et_cmm_estatus_id integer NOT NULL,
    et_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    et_usu_usuario_modificado_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (et_equipo_trabajo_id),
    CONSTRAINT usuario_creador FOREIGN KEY (et_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador FOREIGN KEY (et_usu_usuario_modificado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_equipo_trabajo FOREIGN KEY (et_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.equipos_de_trabajo
    OWNER to postgres;

CREATE SEQUENCE seq_uet_usuario_equipo_de_trabajo_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.usuarios_equipo_de_trabajo
(
    uet_usuario_equipo_de_trabajo_id INTEGER NOT NULL DEFAULT nextval('seq_uet_usuario_equipo_de_trabajo_id'::regclass),
    uet_et_equipo_de_trabajo_id integer NOT NULL,
    uet_usu_usuario_id integer NOT NULL,
    uet_usu_usuario_asignado_por_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    uet_cmm_estatus_id integer NOT NULL,
    "updatedAt" timestamp,
    uet_usu_usuario_modificado_por_id integer,
    PRIMARY KEY (uet_usuario_equipo_de_trabajo_id),
    CONSTRAINT equipo_trabajo_id FOREIGN KEY (uet_et_equipo_de_trabajo_id)
        REFERENCES public.equipos_de_trabajo (et_equipo_trabajo_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_id FOREIGN KEY (uet_usu_usuario_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creado_por FOREIGN KEY (uet_usu_usuario_asignado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_asignacion FOREIGN KEY (uet_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificado_por FOREIGN KEY (uet_usu_usuario_modificado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.usuarios_equipo_de_trabajo
    OWNER to postgres;

ALTER TABLE public.usuarios_equipo_de_trabajo 
    ADD CONSTRAINT relacion_equipo_usuario UNIQUE (uet_et_equipo_de_trabajo_id, uet_usu_usuario_id);


----------------------------------------- METAS EQUIPOS ------------------------------

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
    1000025,
    'ESTATUS_META_EQUIPO',
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
    1000026,
    'ESTATUS_META_EQUIPO',
    'ANACTIVO',
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
    1000027,
    'ESTATUS_META_EQUIPO',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);



CREATE SEQUENCE seq_met_meta_equipo_trabajo_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.metas_equipo_trabajo
(
    met_meta_equipo_trabajo_id INTEGER NOT NULL DEFAULT nextval('seq_met_meta_equipo_trabajo_id'::regclass),
    met_et_equipo_trabajo_id integer NOT NULL,
    met_fecha_apertura timestamp NOT NULL,
    met_fecha_finalizacion timestamp NOT NULL,
    met_meta_equipo integer NOT NULL,
    met_usu_usuario_por_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    met_cmm_estatus_id integer NOT NULL,
    met_usu_modificado_por_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (met_meta_equipo_trabajo_id),
    CONSTRAINT equipo_trabajo_id FOREIGN KEY (met_et_equipo_trabajo_id)
        REFERENCES public.equipos_de_trabajo (et_equipo_trabajo_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador FOREIGN KEY (met_usu_usuario_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador FOREIGN KEY (met_usu_modificado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_meta_equipo FOREIGN KEY (met_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.metas_equipo_trabajo
    OWNER to postgres;




--Metas por ususario 
CREATE SEQUENCE seq_muv_meta_usuario_vendedor_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.metas_usuario_vendedor
(
    muv_meta_usuario_vendedor_id INTEGER NOT NULL DEFAULT nextval('seq_muv_meta_usuario_vendedor_id'::regclass),
    muv_usu_usuario_id integer NOT NULL,
    muv_meta integer NOT NULL,
    muv_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    muv_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    muv_fecha_inicio timestamp NOT NULL check(muv_fecha_inicio < muv_fecha_finalizacion),
    muv_fecha_finalizacion timestamp NOT NULL check(muv_fecha_finalizacion > muv_fecha_inicio),
    muv_cmm_estatus_id integer NOT NULL,
    PRIMARY KEY (muv_meta_usuario_vendedor_id),
    CONSTRAINT usuario_asignado_id FOREIGN KEY (muv_usu_usuario_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creado_por_id FOREIGN KEY (muv_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificado_por_id FOREIGN KEY (muv_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_meta FOREIGN KEY (muv_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.metas_usuario_vendedor
    OWNER to postgres;

    
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
    1000028,
    'ESTATUS_META_USUARIO',
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
    1000029,
    'ESTATUS_META_USUARIO',
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
    1000030,
    'ESTATUS_META_USUARIO',
    'ELIMINADA',
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
    1000031,
    'ESTATUS_META_USUARIO',
    'COMPLETADA',
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
    1000032,
    'ESTATUS_META_USUARIO',
    'NO COMPLETADA',
    TRUE,
    TRUE,
    1,
    current_date
);

-----------------------------------------  COLECCIONES DE PRODUCTOS -------------------------------------------
CREATE SEQUENCE seq_col_coleccion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.colecciones
(
    col_coleccion_id INTEGER NOT NULL DEFAULT nextval('seq_col_coleccion_id'::regclass),
    col_nombre character varying(100) NOT NULL,
    col_descripcion character varying(500) NOT NULL,
    col_cmm_estatus_id integer NOT NULL,
    col_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    col_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (col_coleccion_id),
    CONSTRAINT usuario_creador FOREIGN KEY (col_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador FOREIGN KEY (col_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_coleccion FOREIGN KEY (col_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.colecciones
    OWNER to postgres;


     
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
    1000033,
    'ESTATUS_COLECCION',
    'ACTIVA',
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
    1000034,
    'ESTATUS_COLECCION',
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
    1000035,
    'ESTATUS_COLECCION',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);


