-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/03 
-- Description:	Se agregaron los CFDI 
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






CREATE TABLE public.cfdi (
	cfdi_cfdi_id int4 NOT NULL,
	cfdi_codigo varchar NULL,
	cfdi_texto varchar NULL,
	CONSTRAINT cfdi_pk PRIMARY KEY (cfdi_cfdi_id)
);

ALTER TABLE public.cfdi ADD "createdAt" timestamp(0) NULL;
ALTER TABLE public.cfdi ADD "updatedAt" timestamp(0) NULL;


INSERT INTO cfdi (cfdi_cfdi_id, cfdi_codigo, cfdi_texto, "createdAt") VALUES
(1, 'D01', 'Honorarios médicos, dentales y gastos hospitalarios', now()),
(2, 'D02', 'Gastos médicos por incapacidad o discapacidad', now()),
(3, 'D03', 'Gastos funerales', now()),
(4, 'D04', 'Donativos', now()),
(5, 'D05', 'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)', now()),
(6, 'D06', 'Aportaciones voluntarias al SAR', now()),
(7, 'D07', 'Primas por seguros de gastos médicos', now()),
(8, 'D08', 'Gastos por transportación escolar obligatoria', now()),
(9, 'D09', 'Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones', now()),
(10, 'D10', 'Pagos por servicios educativos (colegiaturas)', now()),
(11, 'G01', 'Adquisición de mercancías', now()),
(12, 'G02', 'Devoluciones, descuentos o bonificaciones', now()),
(13, 'G03', 'Gastos en general', now()),
(14, 'I01', 'Construcciones', now()),
(15, 'I02', 'Mobilario y equipo de oficina por inversiones', now()),
(16, 'I03', 'Equipo de transporte', now()),
(17, 'I04', 'Equipo de computo y accesorios', now()),
(18, 'I05', 'Dados, troqueles, moldes, matrices y herramental', now()),
(19, 'I06', 'Comunicaciones telefónicas', now()),
(20, 'I07', 'Comunicaciones satelitales', now()),
(21, 'I08', 'Otra maquinaria y equipo', now()),
(22, 'P01', 'Por definir', now());




