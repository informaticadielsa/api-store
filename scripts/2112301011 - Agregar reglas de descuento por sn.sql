-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2021/12/30 
-- Description:	 Agregar reglas de descuento por sn 
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







ALTER TABLE public.socios_negocio ADD sn_codigo_grupo varchar NULL;
ALTER TABLE public.socios_negocio ADD sn_porcentaje_descuento_total varchar NULL;
COMMENT ON COLUMN public.socios_negocio.sn_porcentaje_descuento_total IS 'Campo de sap que se comparara con el descuento de grupos';
ALTER TABLE public.socios_negocio ADD sn_prop_10 varchar NULL;
COMMENT ON COLUMN public.socios_negocio.sn_prop_10 IS 'Campo especifico para Dielsa que calcula el descuento por grupo';






CREATE SEQUENCE seq_sndes_socios_negocio_descuentos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.socios_negocio_descuentos (
	sndes_socios_negocio_descuentos_id int4 NULL DEFAULT nextval('seq_sndes_socios_negocio_descuentos_id'::regclass),
	sndes_sn_cardcode varchar NULL,
	sndes_tipo varchar NULL,
	sndes_fecha_inicio date NULL,
	sndes_fecha_final date NULL,
	sndes_cmm_estatus_id int4 NULL,
	sndes_porcentaje_descuento float4 NULL,
	sndes_prod_sku varchar NULL,
	sndes_subtipo varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT socios_negocio_descuentos_pk PRIMARY KEY (sndes_socios_negocio_descuentos_id),
	CONSTRAINT socios_negocio_descuentos_fk FOREIGN KEY (sndes_sn_cardcode) REFERENCES public.socios_negocio(sn_cardcode),
	CONSTRAINT socios_negocio_descuentos_fk_1 FOREIGN KEY (sndes_prod_sku) REFERENCES public.productos(prod_sku),
	CONSTRAINT socios_negocio_descuentos_fk_2 FOREIGN KEY (sndes_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id)
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
    1000175,
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
    1000176,
    'ESTATUS_POLITICA_ENVIO',
    'INACTIVA',
    TRUE,
    TRUE,
    1,
    current_date
);





ALTER TABLE public.socios_negocio_descuentos DROP CONSTRAINT socios_negocio_descuentos_fk;
ALTER TABLE public.socios_negocio_descuentos RENAME COLUMN sndes_sn_cardcode TO sndes_codigo;

ALTER TABLE public.socios_negocio_descuentos DROP CONSTRAINT socios_negocio_descuentos_fk_1;
ALTER TABLE public.socios_negocio_descuentos RENAME COLUMN sndes_prod_sku TO sndes_sub_codigo;





ALTER TABLE public.productos ADD prod_codigo_grupo varchar NULL;
ALTER TABLE public.productos ADD prod_codigo_marca varchar NULL;
ALTER TABLE public.productos ADD prod_codigo_prop_list json NULL;





ALTER TABLE public.socios_negocio DROP COLUMN sn_prop_10;

