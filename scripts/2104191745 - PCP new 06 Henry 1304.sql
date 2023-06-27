-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/04/19 
-- Description:	 PCP new 06 Henry 1304 
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





ALTER TABLE public.facturas ADD fac_factura_sap varchar NULL;







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
    1000130,
    'ESTATUS_BANNERS',
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
    1000131,
    'ESTATUS_BANNERS',
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
    1000132,
    'ESTATUS_BANNERS',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);




CREATE SEQUENCE seq_bnr_banners_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.banners (
	bnr_banners_id int4 NOT NULL DEFAULT nextval('seq_bnr_banners_id'::regclass),
	bnr_identificador varchar NULL,
	bnr_descripcion varchar NULL,
	bnr_url_img varchar NULL,
	bnr_nombre varchar NULL,
	bnr_cmm_estatus_id int4 NULL,
	bnr_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	bnr_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT banners_pk PRIMARY KEY (bnr_banners_id)
);


ALTER TABLE public.banners ADD CONSTRAINT banners_fk FOREIGN KEY (bnr_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id);














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
    1000133,
    'ESTATUS_SLIDERS',
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
    1000134,
    'ESTATUS_SLIDERS',
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
    1000135,
    'ESTATUS_SLIDERS',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);




CREATE SEQUENCE seq_sld_slider_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.sliders (
	sld_sliders_id int4 NOT NULL DEFAULT nextval('seq_sld_slider_id'::regclass),
	sld_identificador varchar NULL,
	sld_nombre varchar NULL,
	sld_descripcion varchar NULL,
	sld_url_img varchar NULL,
	sld_cmm_estatus_id int4 NULL,
	sld_usu_usuario_creador_id int4 NULL,
	"createdAt" timestamp(0) NULL,
	sld_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT slider_pk PRIMARY KEY (sld_sliders_id)
);


ALTER TABLE public.sliders ADD CONSTRAINT sliders_fk FOREIGN KEY (sld_cmm_estatus_id) REFERENCES public.sliders(sld_sliders_id);
ALTER TABLE public.sliders DROP CONSTRAINT sliders_fk;
ALTER TABLE public.sliders ADD CONSTRAINT cmm_id FOREIGN KEY (sld_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id);




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
    13,
    'FRANJA_INFORMATIVA',
    'ENVIOS A TODO MEXICO',
    TRUE,
    TRUE,
    1,
    current_date
);
















