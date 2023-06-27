-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/02/14 
-- Description:	 SAP OVMenssage 
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









ALTER TABLE public.compras_finalizadas ADD cf_mensajeov varchar NULL;
ALTER TABLE public.compras_finalizadas ADD cf_mensajeov_usd varchar NULL;
ALTER TABLE public.compras_finalizadas ADD cf_sap_json_creacion varchar NULL;
ALTER TABLE public.compras_finalizadas ADD cf_sap_json_creacion_usd varchar NULL;




ALTER TABLE public.compras_finalizadas ALTER COLUMN cf_estatus_creacion_sap_usd DROP DEFAULT;
ALTER TABLE public.compras_finalizadas ALTER COLUMN cf_estatus_creacion_sap DROP DEFAULT;

