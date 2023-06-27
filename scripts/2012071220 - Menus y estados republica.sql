-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/12/07 
-- Description:	 Menus y estados republica 
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


INSERT INTO menus
(
    mn_nombre,
    mn_ruta,
    mn_cmm_estatus_id,
    mn_usu_usuario_creado_por_id ,
    "createdAt"
)VALUES(
    'Colecciones',
    '/colecciones',
    1000004,
    1,
    current_date
);




INSERT INTO menus
(
    mn_nombre,
    mn_ruta,
    mn_cmm_estatus_id,
    mn_usu_usuario_creado_por_id ,
    "createdAt"
)VALUES(
    'Lista de precios',
    '/lista_de_precios',
    1000004,
    1,
    current_date
);



INSERT INTO menus
(
    mn_nombre,
    mn_ruta,
    mn_cmm_estatus_id,
    mn_usu_usuario_creado_por_id ,
    "createdAt"
)VALUES(
    'Almacenes, (Virtuales y Fisicos)',
    '/almacenes',
    1000004,
    1,
    current_date
);




------------------------------ PAIS  --------------------------------------------------------
CREATE SEQUENCE seq_pais_pais_id START WITH 53 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.paises
(
    pais_pais_id integer NOT NULL DEFAULT nextval('seq_pais_pais_id'::regclass),
    pais_abreviatura character varying(10) NOT NULL,
    pais_nombre character varying(250) NOT NULL,
    pais_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    pais_usu_modificado_por_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (pais_pais_id),
    CONSTRAINT usuario_creador_id FOREIGN KEY (pais_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador_id FOREIGN KEY (pais_usu_modificado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.paises
    OWNER to postgres;

insert into paises (
    pais_pais_id,
    pais_abreviatura,
    pais_nombre,
    pais_usu_usuario_creador_id,
    "createdAt"
)
values 
(
    52,
    'MX',
    'Mexico',
    1,
    current_date
);


-------------------------------- Estados ------------------------
CREATE SEQUENCE seq_estpa_estado_pais_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.estados_paises
(
    estpa_estado_pais_id  integer NOT NULL DEFAULT nextval('seq_estpa_estado_pais_id'::regclass),
    estpa_pais_pais_id integer NOT NULL,
    estpa_estado_nombre character varying(500) NOT NULL,
    estpa_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    estpa_usu_usuario_modificador_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (estpa_estado_pais_id),
    CONSTRAINT pais_id FOREIGN KEY (estpa_pais_pais_id)
        REFERENCES public.paises (pais_pais_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador FOREIGN KEY (estpa_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador FOREIGN KEY (estpa_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.estados_paises
    OWNER to postgres;



insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Aguascalientes',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Baja California',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Baja California Sur',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Campeche',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Chiapas',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Chihuahua',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Coahuila',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Colima',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Distrito Federal',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Durango',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Estado de México',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Guanajuato',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Guerrero',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Hidalgo',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Jalisco',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Michoacan',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Morelos',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Nayarit',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Nuevo León',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Oaxaca',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Puebla',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Queretaro',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Quintana Roo',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'San Luis Potosi',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Sinaloa',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Sonora',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Tabasco',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Tamaulipas',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Tlaxcala',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Veracruz',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Yucatan',
    1,
    current_date
);
insert into estados_paises(
    estpa_pais_pais_id,
    estpa_estado_nombre,
    estpa_usu_usuario_creador_id,
    "createdAt"
)
values(
    52,
    'Zacatecas',
    1,
    current_date
);



---------------------- Recreamos la tabla almacenes ----------------------- 
drop table almacenes;
CREATE TABLE public.almacenes (
    alm_almacen_id integer NOT NULL DEFAULT nextval('seq_et_equipo_trabajo_id'::regclass),
    alm_nombre character varying(150) NOT NULL,
    alm_codigo_postal integer NOT NULL,
    alm_direccion character varying(100),
    alm_cmm_estatus_id integer NOT NULL,
    alm_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    alm_usu_usuario_modificado_id integer,
    "updatedAt" timestamp,
    alm_pais_id integer not null,
    alm_estado_pais_id integer not null,
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
        NOT VALID,
    CONSTRAINT pais_id FOREIGN KEY (alm_pais_id)
        REFERENCES public.paises (pais_pais_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estado_id FOREIGN KEY (alm_estado_pais_id)
        REFERENCES public.estados_paises (estpa_estado_pais_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.almacenes OWNER TO postgres;


