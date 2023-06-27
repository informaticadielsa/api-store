-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/11/03 
-- Description:	 cotizaciones campos totales 
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
ALTER TABLE public.cotizaciones ADD cot_iva int4 NULL;
ALTER TABLE public.cotizaciones ADD cot_descuento_total float4 NULL;
ALTER TABLE public.cotizaciones ADD cot_total_base float4 NULL;
ALTER TABLE public.cotizaciones ADD cot_total_promocion float4 NULL;
