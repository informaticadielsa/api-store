-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/01/03 
-- Description:	 Crear Apis para Newsletter 
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








CREATE SEQUENCE seq_nlt_newsletter_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;



CREATE TABLE public.newsletter (
    nlt_newsletter_id int4 NOT NULL DEFAULT nextval('seq_nlt_newsletter_id'::regclass),
    nlt_email varchar NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NULL,
    CONSTRAINT newsletter_pk PRIMARY KEY (nlt_newsletter_id),
    CONSTRAINT newsletter_un UNIQUE (nlt_email)
);
