-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/07/14 
-- Description:	 correos 
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
    1000191,
    'TIPO_CORREO',
    'TRANSITO',
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
    1000192,
    'TIPO_CORREO',
    'ENTREGADO',
    TRUE,
    TRUE,
    1,
    current_date
);


CREATE SEQUENCE seq_correos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.correos (
    cor_correos_id int4 NOT NULL DEFAULT nextval('seq_correos_id'::regclass),
    cor_pcf_producto_compra_finalizada_id int4 NOT NULL,
    cor_cmm_tipo_correo int4 NOT NULL,
    "createdAt" timestamp(0) NULL,
    "updatedAt" timestamp(0) NULL
);




ALTER TABLE public.correos ADD CONSTRAINT correos_pk PRIMARY KEY (cor_correos_id);
ALTER TABLE public.correos ADD cor_pcf_cf_compra_finalizada_id int4 NULL;

