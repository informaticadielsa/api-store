-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/04/29 
-- Description:	 CodigoPostales 
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
















CREATE SEQUENCE seq_cp_codigos_postales START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.codigos_postales (
    cp_codigos_postales_id int4 NOT NULL DEFAULT nextval('seq_cp_codigos_postales'::regclass),
    cp_codigo_postal int4 NOT NULL,
    cp_estado_pais_id int4 NOT NULL,
    CONSTRAINT codigos_postales_pk PRIMARY KEY (cp_codigos_postales_id)
);


ALTER TABLE public.codigos_postales ADD "createdAt" timestamp(0) NULL;
ALTER TABLE public.codigos_postales ADD "updatedAt" timestamp(0) NULL;
ALTER TABLE public.codigos_postales ADD CONSTRAINT codigos_postales_un UNIQUE (cp_codigo_postal);
ALTER TABLE public.codigos_postales ALTER COLUMN cp_codigo_postal TYPE varchar USING cp_codigo_postal::varchar;
ALTER TABLE public.codigos_postales ADD cp_frontera int4 NULL;




ALTER TABLE public.compras_finalizadas ADD cf_referencia varchar NULL;


















