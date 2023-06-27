-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2023/01/11 
-- Description:	 conekta devoluciones 
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
ALTER TABLE public.conekta_pagos ADD cnk_amount_devolucion int4 NULL;


CREATE SEQUENCE seq_conekta_pagos_devoluciones_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.conekta_pagos_devoluciones (
	cnk_conekta_pagos_devoluciones int4 NOT NULL DEFAULT nextval('seq_conekta_pagos_devoluciones_id'::regclass),
	cnk_cdc_numero_orden varchar NOT NULL,
	cnk_respuesta varchar NULL,
	"createdAt" timestamp(0) NULL,
	cnk_usu_usuario_creador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT conekta_pagos_devoluciones_pk PRIMARY KEY (cnk_conekta_pagos_devoluciones)
);



ALTER TABLE public.conekta_pagos_devoluciones RENAME COLUMN cnk_conekta_pagos_devoluciones TO cnkd_conekta_pagos_devoluciones;
ALTER TABLE public.conekta_pagos_devoluciones RENAME COLUMN cnk_cdc_numero_orden TO cnkd_cdc_numero_orden;
ALTER TABLE public.conekta_pagos_devoluciones RENAME COLUMN cnk_respuesta TO cnkd_respuesta;
ALTER TABLE public.conekta_pagos_devoluciones RENAME COLUMN cnk_usu_usuario_creador_id TO cnkd_usu_usuario_creador_id;

ALTER TABLE public.conekta_pagos_devoluciones ADD cnkd_conekta_error_message varchar NULL;
ALTER TABLE public.conekta_pagos_devoluciones ADD cnkd_conekta_status varchar NULL;
