-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/25 
-- Description:	 Mario Eliminamos las relaciones de stockproducto 
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
-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/04/27 
-- Description:	26Mas 
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
    1000139,
    'ALMACEN_PICKUP',
    'DISPONIBLE',
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
    1000140,
    'ALMACEN_PICKUP',
    'NO DISPONIBLE',
    TRUE,
    TRUE,
    1,
    current_date
);



ALTER TABLE public.almacenes ADD alm_pickup_stores int4 NULL;
ALTER TABLE public.almacenes ADD CONSTRAINT pickup_store_fk FOREIGN KEY (alm_pickup_stores) REFERENCES public.controles_maestros_multiples(cmm_control_id);

















