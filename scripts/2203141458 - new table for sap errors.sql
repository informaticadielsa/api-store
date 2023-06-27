-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/03/14 
-- Description:	 new table for sap errors 
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

CREATE SEQUENCE seq_cfse_compras_finalizadas_sap_errores START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.compras_finalizadas_sap_errores (
	cfse_compras_finalizadas_sap_errores int4 NOT NULL DEFAULT nextval('seq_cfse_compras_finalizadas_sap_errores'::regclass),
	cfse_cf_compra_numero_orden varchar NULL,
	cfse_cf_mensajeov varchar NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NULL,
	cfse_cf_usu_usuario_modifica int4 NULL,
	cfse_solucion varchar NULL,
	cfse_cmm_estatus_id int4 NOT NULL
);


ALTER TABLE public.compras_finalizadas_sap_errores RENAME COLUMN cfse_compras_finalizadas_sap_errores TO cfse_compras_finalizadas_sap_errores_id;




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
    1000181,
    'ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES',
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
    1000182,
    'ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES',
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
    1000183,
    'ESTATUS_COMPRAS_FINALIZADAS_SAP_ERRORES',
    'SOLUCIONADO',
    TRUE,
    TRUE,
    1,
    current_date
);
