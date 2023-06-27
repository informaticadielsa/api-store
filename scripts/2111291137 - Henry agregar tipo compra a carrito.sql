-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/11/29 
-- Description:	 Henry agregar tipo compra a carrito 
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






ALTER TABLE public.carrito_de_compras ADD cdc_forma_pago_codigo varchar NULL;
ALTER TABLE public.pre_compras_finalizadas ALTER COLUMN cf_cmm_tipo_compra_id DROP NOT NULL;
ALTER TABLE public.compras_finalizadas ALTER COLUMN cf_cmm_tipo_compra_id DROP NOT NULL;




ALTER TABLE public.pre_productos_de_compra_finalizada ADD pcf_almacen_linea varchar NULL;
ALTER TABLE public.pre_productos_de_compra_finalizada ADD pcf_is_backorder bool NULL DEFAULT false;
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_almacen_linea varchar NULL;
ALTER TABLE public.productos_de_compra_finalizada ADD pcf_is_backorder bool NULL DEFAULT false;



ALTER TABLE public.compras_finalizadas ADD cf_orden_subtotal float4 NULL;
ALTER TABLE public.compras_finalizadas ADD cf_orden_descuento float4 NULL;
ALTER TABLE public.compras_finalizadas ADD cf_orden_subtotal_aplicado float4 NULL;
ALTER TABLE public.compras_finalizadas ADD cf_orden_gastos_envio float4 NULL;
ALTER TABLE public.compras_finalizadas ADD cf_order_iva float4 NULL;





ALTER TABLE public.productos_de_compra_finalizada ADD pcf_dias_resurtimiento int4 NULL;
ALTER TABLE public.pre_productos_de_compra_finalizada ADD pcf_dias_resurtimiento int4 NULL;




ALTER TABLE public.carrito_de_compras ADD cdc_referencia varchar NULL;











