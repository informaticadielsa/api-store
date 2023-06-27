-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/10/25 
-- Description:	 Ciudades Estados Codigos postales 
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









CREATE SEQUENCE seq_city_ciudades_estados_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.ciudades_estados (
	city_ciudades_estados_id int4 NOT NULL DEFAULT nextval('seq_city_ciudades_estados_id'::regclass),
	city_ciudad varchar NOT NULL,
	city_estpa_estado_pais_id int4 NOT NULL,
	city_codigo_postal int4 NOT NULL,
	city_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT ciudades_estados_pk PRIMARY KEY (city_ciudades_estados_id),
	CONSTRAINT ciudades_estados_fk FOREIGN KEY (city_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT ciudades_estados_fk_1 FOREIGN KEY (city_estpa_estado_pais_id) REFERENCES public.estados_paises(estpa_estado_pais_id)
);





CREATE SEQUENCE seq_citycp_ciudades_cp_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;





CREATE TABLE public.citycp_ciudades_cp (
	citycp_ciudades_cp int4 NOT NULL DEFAULT nextval('seq_citycp_ciudades_cp_id'::regclass),
	citycp_city_ciudades_estados_id int4 NOT NULL,
	citycp_cp int4 NOT NULL,
	citycp_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT citycp_ciudades_cp_pk PRIMARY KEY (citycp_ciudades_cp),
	CONSTRAINT citycp_ciudades_cp_fk FOREIGN KEY (citycp_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT citycp_ciudades_cp_fk_1 FOREIGN KEY (citycp_city_ciudades_estados_id) REFERENCES public.ciudades_estados(city_ciudades_estados_id)
);


ALTER TABLE public.ciudades_estados DROP COLUMN city_codigo_postal;
ALTER TABLE public.citycp_ciudades_cp RENAME TO ciudades_estados_cp;
ALTER TABLE public.ciudades_estados_cp RENAME COLUMN citycp_ciudades_cp TO citycp_ciudades_estados_cp;





CREATE SEQUENCE poe_politicas_envio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.politicas_envio (
	poe_politicas_envio int4 NOT NULL DEFAULT nextval('poe_politicas_envio_id'::regclass),
	poe_nombre varchar NOT NULL,
	poe_monto float4 NOT NULL,
	poe_dias_minimo int4 NOT NULL,
	poe_dias_maximo int4 NOT NULL,
	poe_cmm_tipo_politica_envio int4 NOT NULL,
	poe_cmm_estatus_id int4 NOT NULL,
	poe_usu_usuario_creador_id int4 NOT NULL,
	"createdAt" timestamp(0) NULL,
	poe_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT politicas_envio_pk PRIMARY KEY (poe_politicas_envio),
	CONSTRAINT creado_por FOREIGN KEY (poe_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT modificado_por FOREIGN KEY (poe_usu_usuario_modificador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT cmm_tipo FOREIGN KEY (poe_cmm_tipo_politica_envio) REFERENCES public.controles_maestros_multiples(cmm_control_id),
	CONSTRAINT cmm_status FOREIGN KEY (poe_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id)
);



CREATE SEQUENCE seq_poe_politicas_envio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.politicas_envio RENAME COLUMN poe_politicas_envio TO poe_politicas_envio_id;

CREATE TABLE public.politicas_envio_almacenes (
	poew_politicas_envio_almacenes_id int4 NOT NULL DEFAULT nextval('seq_poe_politicas_envio_id'::regclass),
	poew_poe_politicas_envio_id int4 NOT NULL,
	poew_alm_almacen_id int4 NOT NULL,
	poew_usu_usuario_creador_id int4 NOT NULL,
	"createdAt" timestamp(0) NULL,
	poew_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT politicas_envio_almacenes_pk PRIMARY KEY (poew_politicas_envio_almacenes_id),
	CONSTRAINT almacenes_id FOREIGN KEY (poew_alm_almacen_id) REFERENCES public.almacenes(alm_almacen_id),
	CONSTRAINT politicas_envio_almacenes_fk_3 FOREIGN KEY (poew_poe_politicas_envio_id) REFERENCES public.politicas_envio(poe_politicas_envio_id),
	CONSTRAINT politicas_envio_almacenes_fk_4 FOREIGN KEY (poew_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT politicas_envio_almacenes_fk_5 FOREIGN KEY (poew_usu_usuario_modificador_id) REFERENCES public.usuarios(usu_usuario_id)
);



CREATE SEQUENCE seq_poedata_politicas_envio_data_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.politicas_envio_data (
	poedata_politicas_envio_data_id int4 NOT NULL DEFAULT nextval('seq_poedata_politicas_envio_data_id'::regclass),
	poedata_poe_politicas_envio_id int4 NOT NULL,
	poedata_pais_pais_id int4 NULL,
	poedata_estpa_estado_pais_id int4 NULL,
	poedata_city_ciudades_estados_id int4 NULL,
	poedata_cp_inicio int4 NULL,
	poedata_cp_final int4 NULL,
	poedata_usu_usuario_creador_id int4 NOT NULL,
	"createdAt" timestamp(0) NULL,
	poedata_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT politicas_envio_data_pk PRIMARY KEY (poedata_politicas_envio_data_id),
	CONSTRAINT pais_id FOREIGN KEY (poedata_pais_pais_id) REFERENCES public.paises(pais_pais_id),
	CONSTRAINT estado_id FOREIGN KEY (poedata_estpa_estado_pais_id) REFERENCES public.estados_paises(estpa_estado_pais_id),
	CONSTRAINT ciudad_id FOREIGN KEY (poedata_city_ciudades_estados_id) REFERENCES public.ciudades_estados(city_ciudades_estados_id),
	CONSTRAINT creado_por FOREIGN KEY (poedata_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT modificado_por FOREIGN KEY (poedata_usu_usuario_modificador_id) REFERENCES public.usuarios(usu_usuario_id)
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
    1000172,
    'ESTATUS_POLITICA_ENVIO',
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
    1000173,
    'ESTATUS_POLITICA_ENVIO',
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
    1000174,
    'ESTATUS_POLITICA_ENVIO',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);



insert into controles_maestros_multiples 
(
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
)
values
(
	14,
	'ESTATUS_POLITICA_ENVIO_TIPO',
	'Fijo',
	false,
	true,
	1,
	current_date
);


insert into controles_maestros_multiples 
(
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
)
values
(
	15,
	'ESTATUS_POLITICA_ENVIO_TIPO',
	'Definido Por Paquetería',
	false,
	true,
	1,
	current_date
);


ALTER TABLE public.politicas_envio_almacenes ALTER COLUMN poew_usu_usuario_creador_id DROP NOT NULL;
ALTER TABLE public.politicas_envio_data ALTER COLUMN poedata_usu_usuario_creador_id DROP NOT NULL;
ALTER TABLE public.politicas_envio ALTER COLUMN poe_usu_usuario_creador_id DROP NOT NULL;


ALTER TABLE public.politicas_envio ALTER COLUMN poe_monto DROP NOT NULL;
