-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/06/04 
-- Description:	 Server 04 06 Conekta Pagos 
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









CREATE SEQUENCE seq_conekta_pagos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;







CREATE TABLE public.conekta_pagos (
	cnk_conekta_pagos int4 NOT NULL DEFAULT nextval('seq_conekta_pagos_id'::regclass),
	cnk_cdc_numero_orden varchar NOT NULL,
	cnk_respuesta varchar NULL,
	"createdAt" timestamp(0) NULL,
	cnk_usu_usuario_creador_id int4 NULL,
	cnk_estatus_pago varchar NULL,
	CONSTRAINT conekta_pagos_pk PRIMARY KEY (cnk_conekta_pagos)
);


ALTER TABLE public.conekta_pagos ADD "updatedAt" timestamp(0) NULL;
ALTER TABLE public.conekta_pagos ADD cnk_conekta_order_id varchar NULL;




















