-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/12/06 
-- Description:	 cotizaciones_fecha_envio_pendiente 
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
ALTER TABLE public.cotizaciones_productos ADD cotp_backorder_fecha_envio_pendiente bool NULL;
ALTER TABLE public.cotizaciones_productos ALTER COLUMN cotp_backorder_fecha_envio_pendiente SET DEFAULT false;
