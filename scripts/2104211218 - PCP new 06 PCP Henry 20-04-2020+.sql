-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/04/21 
-- Description:	 PCP new 06 PCP Henry 20-04-2020+ 
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


















ALTER TABLE public.productos ADD prod_total_stock float4 NULL DEFAULT 0;
Update productos set prod_total_stock = 0;










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
    1000136,
    'ESTATUS_PROVEEDORES',
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
    1000137,
    'ESTATUS_PROVEEDORES',
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
    1000138,
    'ESTATUS_PROVEEDORES',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);







CREATE SEQUENCE seq_prv_proveedores_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.proveedores (
    prv_proveedores_id int4 NOT NULL DEFAULT nextval('seq_prv_proveedores_id'::regclass),
    prv_nombre varchar NOT NULL,
    prv_cmm_estatus_id int4 NOT NULL,
    prv_usu_usuario_creador_id int4 NULL,
    "createdAt" timestamp(0) NULL,
    prv_usu_usuario_modificador_id int4 NULL,
    "updatedAt" timestamp(0) NULL,
    CONSTRAINT proveedores_pk PRIMARY KEY (prv_proveedores_id),
    CONSTRAINT proveedores_fk FOREIGN KEY (prv_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id)
);




ALTER TABLE public.productos ADD prod_proveedor_id int4 NULL;
ALTER TABLE public.productos ADD CONSTRAINT proveedor_fk FOREIGN KEY (prod_proveedor_id) REFERENCES public.proveedores(prv_proveedores_id);














