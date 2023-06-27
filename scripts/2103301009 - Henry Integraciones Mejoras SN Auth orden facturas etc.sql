-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/03/30 
-- Description:	 Henry Integraciones Mejoras SN Auth orden facturas etc 
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


















ALTER TABLE public.compras_finalizadas ADD cf_estatus_creacion_sap varchar NULL;


ALTER TABLE public.compras_finalizadas ALTER COLUMN cf_estatus_creacion_sap SET DEFAULT -1;

ALTER TABLE public.compras_finalizadas ALTER COLUMN cf_estatus_creacion_sap TYPE int4 USING cf_estatus_creacion_sap::int4;

ALTER TABLE public.compras_finalizadas ADD cf_descripcion_sap varchar NULL;

ALTER TABLE public.vendedores_sap ADD vendsap_telefono varchar NULL;
ALTER TABLE public.vendedores_sap ADD vendsap_mobil varchar NULL;




ALTER TABLE public.raw_socios_negocios ADD pais varchar NULL;
ALTER TABLE public.raw_socios_negocios ADD estado varchar NULL;






ALTER TABLE public.usuarios ADD usu_codigovendedor varchar NULL;
ALTER TABLE public.usuarios RENAME COLUMN usu_codigovendedor TO usu_codigo_vendedor;





ALTER TABLE public.usuarios ADD usu_usuario_mobil varchar NULL;
ALTER TABLE public.usuarios ADD usu_usuario_telefono varchar NULL;























