-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/06/17 
-- Description:	 almacenes logistica 
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



ALTER TABLE public.carrito_de_compras ALTER COLUMN cdc_costo_envio TYPE float4 USING cdc_costo_envio::float4;


CREATE SEQUENCE seq_almlog_almacenes_logistica START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.almacenes_logistica (
	almlog_almacenes_logistica_id int4 NULL DEFAULT nextval('seq_almlog_almacenes_logistica'::regclass),
	almlog_pais_pais_id_origen int4 NULL,
	almlog_estpa_estado_pais_nombre int4 NULL,
	almlog_almacen_codigo varchar NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
	CONSTRAINT almacenes_logistica_pk PRIMARY KEY (almlog_almacenes_logistica_id)
);


ALTER TABLE public.almacenes_logistica ALTER COLUMN almlog_estpa_estado_pais_nombre TYPE varchar USING almlog_estpa_estado_pais_nombre::varchar;

INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(1, 52, 'Aguascalientes', '03', '2021-06-17 11:35:37.034', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(2, 52, 'Baja California', '01', '2021-06-17 11:35:37.036', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(3, 52, 'Baja California Sur', '01', '2021-06-17 11:35:37.036', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(4, 52, 'Campeche', '03', '2021-06-17 11:35:37.037', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(5, 52, 'Chiapas', '03', '2021-06-17 11:35:37.038', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(6, 52, 'Chihuahua', '01', '2021-06-17 11:35:37.039', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(7, 52, 'Coahuila', '01', '2021-06-17 11:35:37.041', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(8, 52, 'Colima', '03', '2021-06-17 11:35:37.042', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(9, 52, 'Durango', '01', '2021-06-17 11:35:37.042', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(10, 52, 'Estado de México', '03', '2021-06-17 11:35:37.043', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(11, 52, 'Guanajuato', '03', '2021-06-17 11:35:37.043', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(12, 52, 'Guerrero', '03', '2021-06-17 11:35:37.044', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(13, 52, 'Hidalgo', '03', '2021-06-17 11:35:37.045', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(14, 52, 'Jalisco', '03', '2021-06-17 11:35:37.045', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(15, 52, 'Ciudad de México', '03', '2021-06-17 11:35:37.046', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(16, 52, 'Michoacan', '03', '2021-06-17 11:35:37.046', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(17, 52, 'Morelos', '03', '2021-06-17 11:35:37.047', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(18, 52, 'Nayarit', '03', '2021-06-17 11:35:37.048', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(19, 52, 'Nuevo León', '01', '2021-06-17 11:35:37.048', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(20, 52, 'Oaxaca', '03', '2021-06-17 11:35:37.049', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(21, 52, 'Puebla', '03', '2021-06-17 11:35:37.050', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(22, 52, 'Queretaro', '03', '2021-06-17 11:35:37.050', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(23, 52, 'Quintana Roo', '03', '2021-06-17 11:35:37.051', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(24, 52, 'San Luis Potosi', '03', '2021-06-17 11:35:37.051', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(25, 52, 'Sinaloa', '01', '2021-06-17 11:35:37.052', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(26, 52, 'Sonora', '01', '2021-06-17 11:35:37.052', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(27, 52, 'Tabasco', '03', '2021-06-17 11:35:37.053', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(28, 52, 'Tamaulipas', '01', '2021-06-17 11:35:37.053', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(29, 52, 'Tlaxcala', '03', '2021-06-17 11:35:37.054', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(30, 52, 'Veracruz', '03', '2021-06-17 11:35:37.054', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(31, 52, 'Yucatan', '03', '2021-06-17 11:35:37.055', NULL);
INSERT INTO public.almacenes_logistica
(almlog_almacenes_logistica_id, almlog_pais_pais_id_origen, almlog_estpa_estado_pais_nombre, almlog_almacen_codigo, "createdAt", "updatedAt")
VALUES(32, 52, 'Zacatecas', '01', '2021-06-17 11:35:37.056', NULL);








