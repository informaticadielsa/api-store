-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/11/10 
-- Description:	 Henry Agregar Promociones a Cart 
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
ALTER TABLE public.productos ADD prod_dias_resurtimiento int4 NULL;


ALTER TABLE public.productos ADD prod_unidades_vendidas float4 NULL DEFAULT 0;


ALTER TABLE public.productos_de_compra_finalizada ADD pcf_sumatorio_mas_vendido_validador bool NOT NULL DEFAULT false;

