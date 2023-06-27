-- ============================================= 
-- Author:		henry kishi 
-- Create date: 2021/11/16 
-- Description:	 Henry Cupones Cambios 
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







ALTER TABLE public.carrito_de_compras ADD cdc_promcup_promociones_cupones_id int4 NULL;
ALTER TABLE public.carrito_de_compras ADD CONSTRAINT carrito_de_compras_fk FOREIGN KEY (cdc_promcup_promociones_cupones_id) REFERENCES public.promociones_cupones(promcup_promociones_cupones_id);

ALTER TABLE public.compras_finalizadas ADD cf_promcup_promociones_cupones_id int4 NULL;





