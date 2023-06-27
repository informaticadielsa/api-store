-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/25 
-- Description:	 Mario Eliminamos las relaciones de stockproducto 
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

delete from stocks_productos where sp_almacen_id  in (
	select alm_almacen_id from almacenes a  where alm_cmm_estatus_id != 1000036
);