-- ============================================= 
-- Author:		DESKTOP-ARAE8GA 
-- Create date: 2023/01/24 
-- Description:	 cotizaciones agregar terminos y condiciones 
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
ALTER TABLE public.cotizaciones ADD cot_terminos_y_condiciones varchar NULL;
