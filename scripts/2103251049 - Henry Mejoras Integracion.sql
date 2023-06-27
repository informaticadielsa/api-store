-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/03/25 
-- Description:	 Henry Mejoras Integracion 
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











CREATE SEQUENCE seq_raw_sngrupos START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_sngrupos (
    raw_sngrupos_id int4 NOT NULL DEFAULT nextval('seq_raw_sngrupos'::regclass),
    "codigoGrupo" varchar NULL,
    "nombreGrupo" varchar NULL,
    "createdAt" timestamp NULL,
    "updatedAt" timestamp NULL,
    CONSTRAINT raw_sngrupos_pk PRIMARY KEY (raw_sngrupos_id)
);







ALTER TABLE public.raw_socios_negocios ADD almacen varchar NULL;
ALTER TABLE public.raw_socios_negocios ADD "idDireccionS" varchar NULL;
ALTER TABLE public.raw_socios_negocios ADD "idDireccionB" varchar NULL;







insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000118,
	'SAP_METODOS_PAGO',
	'ACTIVO',
	true,
	true,
	1,
	current_date
);




insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000119,
	'SAP_METODOS_PAGO',
	'INACTIVA',
	true,
	true,
	1,
	current_date
);




insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000120,
	'SAP_METODOS_PAGO',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);


















CREATE SEQUENCE seq_smp_metodos_pago_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.sap_metodos_pago (
	smp_metodos_pago_id int4 NOT NULL DEFAULT nextval('seq_smp_metodos_pago_id'::regclass),
	smp_codigo_metodo varchar NULL,
	smp_definicion varchar NULL,
	smp_cmm_estatus_id int4 NULL,
	CONSTRAINT sap_metodos_pago_pk PRIMARY KEY (smp_metodos_pago_id),
	CONSTRAINT sap_metodos_pago_fk FOREIGN KEY (smp_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id)
);







INSERT INTO public.sap_metodos_pago
(smp_metodos_pago_id, smp_codigo_metodo, smp_definicion, smp_cmm_estatus_id)
VALUES(1, 'PUE', 'Pago en Una sola Exhibición', 1000118);

INSERT INTO public.sap_metodos_pago
(smp_metodos_pago_id, smp_codigo_metodo, smp_definicion, smp_cmm_estatus_id)
VALUES(2, 'PPD ', 'Pago en Parcialidades o Diferido', 1000118);


















insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000121,
	'SAP_FORMAS_PAGO',
	'ACTIVO',
	true,
	true,
	1,
	current_date
);




insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000122,
	'SAP_FORMAS_PAGO',
	'INACTIVA',
	true,
	true,
	1,
	current_date
);




insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000123,
	'SAP_FORMAS_PAGO',
	'ELIMINADA',
	true,
	true,
	1,
	current_date
);











CREATE SEQUENCE seq_sfp_sap_formas_pago_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.sap_formas_pago (
	sfp_sap_formas_pago_id int4 NOT NULL DEFAULT nextval('seq_sfp_sap_formas_pago_id'::regclass),
	sfp_clave varchar NULL,
	sfp_descripcion varchar NULL,
	sfp_cmm_estatus_id int4 NULL,
	CONSTRAINT sap_formas_pago_pk PRIMARY KEY (sfp_sap_formas_pago_id)
);

ALTER TABLE public.sap_formas_pago ADD "createdAt" timestamp(0) NULL;
ALTER TABLE public.sap_formas_pago ADD "updatedAt" timestamp(0) NULL;


ALTER TABLE public.sap_formas_pago ADD CONSTRAINT cmmstatus FOREIGN KEY (sfp_cmm_estatus_id) REFERENCES public.controles_maestros_multiples(cmm_control_id);




INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(25, '01', 'Efectivo', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(26, '02', 'Cheque nominativo', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(27, '03', 'Transferencia electrónica de fondos', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(28, '04', 'Tarjeta de crédito', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(29, '05', 'Monedero electrónico', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(30, '06', 'Dinero electrónico', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(31, '08', 'Vales de despensa', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(32, '12', 'Dación en pago', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(33, '13', 'Pago por subrogación', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(34, '14', 'Pago por consignación', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(35, '15', 'Condonación', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(36, '17', 'Compensación', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(37, '23', 'Novación', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(38, '24', 'Confusión', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(39, '25', 'Remisión de deuda', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(40, '26', 'Prescripción o caducidad', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(41, '27', 'A satisfacción del acreedor', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(42, '28', 'Tarjeta de débito', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(43, '29', 'Tarjeta de servicios', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(44, '30', 'Aplicación de anticipos', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(45, '31', 'Intermediario pagos', 1000121);
INSERT INTO public.sap_formas_pago
(sfp_sap_formas_pago_id, sfp_clave, sfp_descripcion, sfp_cmm_estatus_id)
VALUES(46, '99', 'Por definir', 1000121);










ALTER TABLE public.compras_finalizadas ADD cf_sap_metodos_pago_codigo varchar NULL;
ALTER TABLE public.compras_finalizadas ADD cf_sap_forma_pago_codigo varchar NULL;















