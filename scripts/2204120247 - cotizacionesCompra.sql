-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/04/12 
-- Description:	 cotizacionesCompra 
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
ALTER TABLE public.cotizaciones ADD cot_cmm_tipo_envio_id int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_direccion_envio_id int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_alm_almacen_recoleccion int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_cmm_tipo_compra_id int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_fletera_id int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_costo_envio float4 NULL;
ALTER TABLE public.cotizaciones ADD cot_promcup_promociones_cupones_id int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_forma_pago_codigo varchar NULL;
ALTER TABLE public.cotizaciones ADD cot_cfdi varchar NULL;
