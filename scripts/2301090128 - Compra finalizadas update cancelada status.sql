-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2023/01/09 
-- Description:	 Compra finalizadas update cancelada status 
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
-- Auto-generated SQL script #202301090110
UPDATE public.controles_maestros_multiples
	SET cmm_valor='Cancelado'
	WHERE cmm_control_id=1000108;
