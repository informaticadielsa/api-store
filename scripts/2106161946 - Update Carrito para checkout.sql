-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/06/16 
-- Description:	 Update Carrito para checkout 
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
-- Author:		henry kishi 
-- Create date: 2021/06/16 
-- Description:	 Compras Finalizadas Guias 
-- --------------------------------------------- 
-- 
-- 
SET statement_timeout = 0; 
SET lock_timeout = 0; 
SET client_encoding = 'UTF8'; 
SET standard_conforming_strings = on; 
SET check_function_bodies = false; 







ALTER TABLE public.carrito_de_compras ADD cdc_cmm_tipo_envio_id int4 NULL;
ALTER TABLE public.carrito_de_compras ADD cdc_direccion_envio_id int4 NULL;
ALTER TABLE public.carrito_de_compras ADD cdc_alm_almacen_recoleccion int4 NULL;
ALTER TABLE public.carrito_de_compras ADD cdc_cmm_tipo_compra_id int4 NULL;
ALTER TABLE public.carrito_de_compras ADD cdc_fletera_id int4 NULL;
ALTER TABLE public.carrito_de_compras ADD cdc_costo_envio int4 NULL;








