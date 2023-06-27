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
SET client_min_messages = warning; 
SET row_security = off; 
SET search_path = public, pg_catalog; 
SET default_tablespace = ''; 
SET default_with_oids = false; 
-- 
-- 










CREATE SEQUENCE seq_cfguias_compras_finalizadas_guias_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;







CREATE TABLE public.compras_finalizadas_guias (
	cfguias_compras_finalizadas_guias_id int4 NOT NULL DEFAULT nextval('seq_cfguias_compras_finalizadas_guias_id'::regclass),
	cfguias_cf_compra_finalizada_id int4 NULL,
	cfguias_carrier varchar NULL,
	cfguias_guia varchar NULL,
	cfguias_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
	CONSTRAINT compras_finalizadas_guias_pk PRIMARY KEY (cfguias_compras_finalizadas_guias_id),
	CONSTRAINT compras_finalizadas_guias_fk FOREIGN KEY (cfguias_cf_compra_finalizada_id) REFERENCES public.carrito_de_compras(cdc_carrito_de_compra_id)
);















