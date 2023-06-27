-- ============================================= 
-- Author:		Henry Kishi Salinas 
-- Create date: 2020/12/15 
-- Description:	 PCP PCP Socio Negocio UuariosSN y Direcciones 
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


-- 
-- 
-- ID's controles maestros multiples Socios Negocios
-- 
-- 



	insert into controles_maestros_multiples ( 
		cmm_control_id,
		cmm_nombre,
		cmm_valor,
		cmm_sistema,
		cmm_activo,
		cmm_usu_usuario_creado_por_id,
		"createdAt"
	) values (
		1000045,
		'ESTATUS_SOCIOS_NEGOCIO',
		'ACTIVA',
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
		1000046,
		'ESTATUS_SOCIOS_NEGOCIO',
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
		1000047,
		'ESTATUS_SOCIOS_NEGOCIO',
		'ELIMINADA',
		true,
		true,
		1,
		current_date
	);
















-- 
-- 
-- ID's controles maestros multiples Socios Negocios Usuarios
-- 
-- 





	insert into controles_maestros_multiples ( 
		cmm_control_id,
		cmm_nombre,
		cmm_valor,
		cmm_sistema,
		cmm_activo,
		cmm_usu_usuario_creado_por_id,
		"createdAt"
	) values (
		1000048,
		'ESTATUS_SOCIOS_NEGOCIO_USUARIO',
		'ACTIVA',
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
		1000049,
		'ESTATUS_SOCIOS_NEGOCIO_USUARIO',
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
		1000050,
		'ESTATUS_SOCIOS_NEGOCIO_USUARIO',
		'ELIMINADA',
		true,
		true,
		1,
		current_date
	);








-- 
-- 
-- ID's controles maestros multiples Socios Negocios Direcciones
-- 
-- 





	insert into controles_maestros_multiples ( 
		cmm_control_id,
		cmm_nombre,
		cmm_valor,
		cmm_sistema,
		cmm_activo,
		cmm_usu_usuario_creado_por_id,
		"createdAt"
	) values (
		1000051,
		'ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES',
		'ACTIVA',
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
		1000052,
		'ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES',
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
		1000053,
		'ESTATUS_SOCIOS_NEGOCIO_DIRECCIONES',
		'ELIMINADA',
		true,
		true,
		1,
		current_date
	);






































-- 
-- 
-- Tabla de Socio de Negocio
-- 
-- 




-- Secuencias para tablas
	CREATE SEQUENCE seq_sn_socio_negocio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
	CREATE SEQUENCE seq_snu_socio_negocio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
	CREATE SEQUENCE seq_snd_socio_negocio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
--


















-- public.socios_negocio definition

-- Drop table

-- DROP TABLE public.socios_negocio;

CREATE TABLE public.socios_negocio (
	sn_socios_negocio_id int4 NOT NULL DEFAULT nextval('seq_sn_socio_negocio_id'::regclass),
	sn_cfdi varchar(50) NOT NULL,
	sn_rfc varchar(50) NOT NULL,
	sn_cardcode varchar(50) NOT NULL,
	sn_credito float4 NULL,
	sn_moneda varchar(10) NULL,
	sn_nombre_empresa varchar(150) NULL,
	sn_tax varchar NULL,
	sn_direccion_facturacion varchar(100) NULL,
	sn_razon_social varchar(100) NULL,
	sn_nombre_comercial varchar(100) NULL,
	sn_email_facturacion varchar(50) NULL,
	sn_telefono_empresa varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	sn_usu_usuario_creador_id int4 NULL,
	sn_usu_usuario_modificado_id int4 NULL,
	sn_pais_id int4 NULL,
	sn_estado_id int4 NULL,
	sn_direccion_empresa varchar NULL,
	sn_lista_precios int4 NULL,
	sn_descripcion_empresa varchar NULL,
	sn_cmm_estatus_id int4 NULL,
	sn_almacen_asignado varchar NULL,
	CONSTRAINT socios_negocio_pk PRIMARY KEY (sn_socios_negocio_id),
	CONSTRAINT socios_negocio_un_cardcode UNIQUE (sn_cardcode)
);


-- public.socios_negocio foreign keys

ALTER TABLE public.socios_negocio ADD CONSTRAINT socios_negocio_fk_cmm_status FOREIGN KEY (sn_cmm_estatus_id) REFERENCES controles_maestros_multiples(cmm_control_id);
ALTER TABLE public.socios_negocio ADD CONSTRAINT socios_negocio_fk_estados FOREIGN KEY (sn_estado_id) REFERENCES estados_paises(estpa_estado_pais_id);
ALTER TABLE public.socios_negocio ADD CONSTRAINT socios_negocio_fk_paises FOREIGN KEY (sn_pais_id) REFERENCES paises(pais_pais_id);









-- 
-- 
-- Insertar Usuario en Socio de negocio
-- 
-- 





INSERT INTO public.socios_negocio(
	sn_cfdi, 
	sn_rfc, 
	sn_cardcode, 
	sn_credito, 
	sn_moneda, 
	sn_nombre_empresa, 
	sn_tax, 
	sn_direccion_facturacion, 
	sn_razon_social, 
	sn_nombre_comercial, 
	sn_email_facturacion, 
	sn_telefono_empresa, 
	"createdAt", 
	sn_usu_usuario_creador_id, 
	sn_usu_usuario_modificado_id, 
	sn_pais_id, 
	sn_estado_id, 
	sn_direccion_empresa, 
	sn_lista_precios, 
	sn_descripcion_empresa, 
	sn_cmm_estatus_id, 
	sn_almacen_asignado
	)
	VALUES(
		'', 
		'', 
		'C000001', 
		0, 
		'', 
		'', 
		'', 
		'', 
		'', 
		'', 
		'', 
		'', 
		current_date,
		0, 
		0, 
		52, 
		1, 
		'', 
		0, 
		'', 
		1000045, 
		''
	);



INSERT INTO public.socios_negocio(
	sn_cfdi, 
	sn_rfc, 
	sn_cardcode, 
	sn_credito, 
	sn_moneda, 
	sn_nombre_empresa, 
	sn_tax, 
	sn_direccion_facturacion, 
	sn_razon_social, 
	sn_nombre_comercial, 
	sn_email_facturacion, 
	sn_telefono_empresa, 
	"createdAt", 
	sn_usu_usuario_creador_id, 
	sn_usu_usuario_modificado_id,
	sn_pais_id, 
	sn_estado_id, 
	sn_direccion_empresa, 
	sn_lista_precios, 
	sn_descripcion_empresa, 
	sn_cmm_estatus_id, 
	sn_almacen_asignado
	)
	VALUES(
		'', 
		'', 
		'C000002', 
		0, 
		'', 
		'', 
		'', 
		'', 
		'', 
		'', 
		'', 
		'', 
		current_date,
		0, 
		0, 
		52, 
		1, 
		'', 
		0, 
		'', 
		1000045, 
		''
	);












































-- 
-- 
-- Tabla de usuarios de Socios de Negocio 
-- 
-- 

-- public.socios_negocio_usuario definition

-- Drop table

-- DROP TABLE public.socios_negocio_usuario;

CREATE TABLE public.socios_negocio_usuario (
	snu_usuario_snu_id int4 NOT NULL DEFAULT nextval('seq_snu_socio_negocio_id'::regclass),
	snu_cardcode varchar(50) NOT NULL,
	snu_nombre varchar(100) NULL,
	snu_primer_apellido varchar(100) NULL,
	snu_segundo_apellido varchar(50) NULL,
	snu_correo_electronico varchar(50) NULL,
	snu_direccion varchar(100) NULL,
	snu_telefono varchar(30) NULL,
	snu_usuario varchar(100) NULL,
	snu_contrasenia varchar(300) NULL,
	snu_genero varchar(30) NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	snu_usu_usuario_creador_id int4 NULL,
	snu_usu_usuario_modificado_id int4 NULL,
	snu_cmm_estatus_id int4 NULL,
	snu_rol_rol_id int4 NULL,
	CONSTRAINT socios_negocio_usuario_pk PRIMARY KEY (snu_usuario_snu_id)
);


-- public.socios_negocio_usuario foreign keys

ALTER TABLE public.socios_negocio_usuario ADD CONSTRAINT socios_negocio_usuario_cardcode_snu FOREIGN KEY (snu_cardcode) REFERENCES socios_negocio(sn_cardcode);
ALTER TABLE public.socios_negocio_usuario ADD CONSTRAINT socios_negocio_usuario_rol_rol_snu FOREIGN KEY (snu_rol_rol_id) REFERENCES roles(rol_rol_id);











	--INSERT INTO public.socios_negocio_usuario(
	--	snu_cardcode, 
	--	snu_nombre, 
	--	snu_primer_apellido, 
	--	snu_segundo_apellido, 
	--	snu_correo_electronico, 
	--	snu_direccion, 
	--	snu_telefono, 
	--	snu_usuario, 
	--	snu_contrasenia, 
	--	snu_genero, 
	--	"createdAt", 
	--	"updatedAt", 
	--	snu_usu_usuario_creador_id, 
	--	snu_usu_usuario_modificado_id, 
	--	snu_cmm_estatus_id,
	--	snu_rol_rol_id
	--	)
	--  VALUES(
	--	'C000001', 
	--	'Prueba1', 
	--	'Pru', 
	--	'eba', 
	--	'asddsa@hot.com', 
	--	'Av smepre vivda', 
	--	'1232123212', 
	--	'primerUsuario', 
	--	'hola', 
	--	'hombre', 
	--	current_date, 
	--	current_date, 
	--	0, 
	--	0, 
	--	1000048,
	--	1
	--);



















-- 
-- 
-- Tabla de DIRECCIONES de Socios de Negocio 
-- 
-- 





-- public.socios_negocio_direcciones definition

-- Drop table

-- DROP TABLE public.socios_negocio_direcciones;

-- public.socios_negocio_direcciones definition

-- Drop table

-- DROP TABLE public.socios_negocio_direcciones;

CREATE TABLE public.socios_negocio_direcciones (
	snd_direcciones_id int4 NOT NULL DEFAULT nextval('seq_snd_socio_negocio_id'::regclass),
	snd_pais_id int4 NULL,
	snd_estado_id int4 NULL,
	snd_ciudad varchar(70) NULL,
	snd_direccion varchar(150) NULL,
	snd_direccion_num_ext int4 NULL,
	snd_direccion_num_int int4 NULL,
	snd_direccion_telefono int4 NULL,
	snd_calle1 varchar(50) NULL,
	snd_calle2 varchar(50) NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	snd_cardcode varchar(50) NOT NULL,
	snd_usu_usuario_creador_id int4 NULL,
	snd_usu_usuario_modificado_id int4 NULL,
	snd_cmm_estatus_id int4 NULL,
	CONSTRAINT socios_negocios_direcciones_pk PRIMARY KEY (snd_direcciones_id)
);


-- public.socios_negocio_direcciones foreign keys

ALTER TABLE public.socios_negocio_direcciones ADD CONSTRAINT socios_negocios_direcciones_fk_cmm_snd FOREIGN KEY (snd_cmm_estatus_id) REFERENCES controles_maestros_multiples(cmm_control_id);
ALTER TABLE public.socios_negocio_direcciones ADD CONSTRAINT socios_negocios_direcciones_fk_estado_snd FOREIGN KEY (snd_estado_id) REFERENCES estados_paises(estpa_estado_pais_id);
ALTER TABLE public.socios_negocio_direcciones ADD CONSTRAINT socios_negocios_direcciones_fk_pais_snd FOREIGN KEY (snd_pais_id) REFERENCES paises(pais_pais_id);
ALTER TABLE public.socios_negocio_direcciones ADD CONSTRAINT socios_negocios_direcciones_fka_cardcode_snd FOREIGN KEY (snd_cardcode) REFERENCES socios_negocio(sn_cardcode);







-- Auto-generated SQL script #202012141753
INSERT INTO public.socios_negocio_direcciones (
	snd_pais_id,
	snd_estado_id,
	snd_ciudad,
	snd_direccion,
	snd_direccion_num_ext,
	snd_direccion_num_int,
	snd_direccion_telefono,
	snd_calle1,
	snd_calle2,
	"createdAt",
	snd_cardcode,
	snd_cmm_estatus_id
	)
	VALUES (
		52,
		1,
		'Guadalajara',
		'Paco',
		21,
		23,
		283387238,
		'Viva',
		'pruyeba',
		current_date,
		'C000001',
		1000051
	);









































































