-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/06/27 
-- Description:	 nuevos usuarios prospectos 
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
    1000188,
    'ESTATUS_USUARIOS_PROSPECTOS',
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
    1000189,
    'ESTATUS_USUARIOS_PROSPECTOS',
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
    1000190,
    'ESTATUS_USUARIOS_PROSPECTOS',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);


CREATE SEQUENCE seq_usuarios_prospectos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.usuarios_prospectos (
    up_usuarios_prospectos_id int4 NOT NULL DEFAULT nextval('seq_usuarios_prospectos_id'::regclass),
    up_razon_social varchar NULL,
    up_nombre_comercial varchar NULL,
    up_rfc varchar NULL,
    up_email_facturacion varchar NULL,
    up_direccion_facturacion varchar NULL,
    up_codigo_postal varchar NULL,
    up_direccion varchar NULL,
    up_direccion_num_ext varchar NULL,
    up_colonia varchar NULL,
    up_ciudad varchar NULL,
    up_pais_id varchar NULL,
    up_estado_id varchar NULL,
    up_cfdi varchar NULL,
    up_datos_b2b varchar NULL,
    up_sitio_web varchar NULL,
    up_numero_cuenta_banco varchar NULL,
    up_nombre_banco varchar NULL,
    up_forma_pago varchar NULL,
    up_medio_pago varchar NULL,
    up_usu_usuario_creador_id int4 NOT NULL,
    "createdAt" timestamp NOT NULL,
    up_usu_usuario_modificado_id int4 NULL,
    "updatedAt" timestamp NULL,
    CONSTRAINT usuarios_prospectos_pk PRIMARY KEY (up_usuarios_prospectos_id)
);

ALTER TABLE public.usuarios_prospectos ALTER COLUMN up_datos_b2b TYPE json USING up_datos_b2b::json;


ALTER TABLE public.usuarios_prospectos ADD up_cmm_estatus_id int4 NULL;







