-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/02/16 
-- Description:	 almacenes pickup 
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
ALTER TABLE public.almacenes DROP CONSTRAINT pickup_store_fk;
ALTER TABLE public.almacenes ALTER COLUMN alm_pickup_stores TYPE bool USING alm_pickup_stores::bool;



ALTER TABLE public.productos_de_compra_finalizada ADD pcf_recoleccion_resurtimiento bool NULL;
ALTER TABLE public.productos_de_compra_finalizada ALTER COLUMN pcf_recoleccion_resurtimiento SET DEFAULT false;




ALTER TABLE public.productos_de_compra_finalizada ADD pcf_linea_num_sap int4 NULL;










