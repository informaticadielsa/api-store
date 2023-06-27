-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/03/20 
-- Description:	 ñlast Integraciones Base 
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







ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_direccion_telefono TYPE int8 USING snd_direccion_telefono::int8;






CREATE SEQUENCE seq_raw_socios_negocios START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_socios_negocios (
	raw_socios_negocios_id int4 NOT NULL DEFAULT nextval('seq_raw_socios_negocios'::regclass),
	"codigoCliente" varchar NULL,
	"codigoGrupo" varchar NULL,
	"codigoListaPrecios" varchar NULL,
	"condicionesCredito" varchar NULL,
	contactos varchar NULL,
	"creditoDisponible" int4 NULL,
	direcciones varchar NULL,
	email varchar NULL,
	estatus varchar NULL,
	"limiteCredito" int4 NULL,
	"nombreComercial" varchar NULL,
	"nombreGrupo" varchar NULL,
	"nombreListaPrecios" varchar NULL,
	"procentajeDescuentoTotal" int4 NULL,
	prop1 varchar NULL,
	prop10 varchar NULL,
	prop11 varchar NULL,
	prop12 varchar NULL,
	prop13 varchar NULL,
	prop14 varchar NULL,
	prop15 varchar NULL,
	prop16 varchar NULL,
	prop17 varchar NULL,
	prop18 varchar NULL,
	prop19 varchar NULL,
	prop2 varchar NULL,
	prop20 varchar NULL,
	prop21 varchar NULL,
	prop22 varchar NULL,
	prop23 varchar NULL,
	prop24 varchar NULL,
	prop25 varchar NULL,
	prop26 varchar NULL,
	prop27 varchar NULL,
	prop28 varchar NULL,
	prop29 varchar NULL,
	prop3 varchar NULL,
	prop30 varchar NULL,
	prop31 varchar NULL,
	prop32 varchar NULL,
	prop33 varchar NULL,
	prop34 varchar NULL,
	prop35 varchar NULL,
	prop36 varchar NULL,
	prop37 varchar NULL,
	prop38 varchar NULL,
	prop39 varchar NULL,
	prop4 varchar NULL,
	prop40 varchar NULL,
	prop41 varchar NULL,
	prop42 varchar NULL,
	prop43 varchar NULL,
	prop44 varchar NULL,
	prop45 varchar NULL,
	prop46 varchar NULL,
	prop47 varchar NULL,
	prop48 varchar NULL,
	prop49 varchar NULL,
	prop5 varchar NULL,
	prop50 varchar NULL,
	prop51 varchar NULL,
	prop52 varchar NULL,
	prop53 varchar NULL,
	prop54 varchar NULL,
	prop55 varchar NULL,
	prop56 varchar NULL,
	prop57 varchar NULL,
	prop58 varchar NULL,
	prop59 varchar NULL,
	prop6 varchar NULL,
	prop60 varchar NULL,
	prop61 varchar NULL,
	prop62 varchar NULL,
	prop63 varchar NULL,
	prop64 varchar NULL,
	prop7 varchar NULL,
	prop8 varchar NULL,
	prop9 varchar NULL,
	"razonSocial" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_socios_negocios_pk PRIMARY KEY (raw_socios_negocios_id)
);



ALTER TABLE public.raw_socios_negocios ALTER COLUMN "creditoDisponible" TYPE float4 USING "creditoDisponible"::float4;
ALTER TABLE public.raw_socios_negocios ALTER COLUMN "limiteCredito" TYPE float4 USING "limiteCredito"::float4;
ALTER TABLE public.raw_socios_negocios ALTER COLUMN "procentajeDescuentoTotal" TYPE float4 USING "procentajeDescuentoTotal"::float4;
ALTER TABLE public.raw_socios_negocios ADD CONSTRAINT raw_socios_negocios_un UNIQUE ("codigoCliente");


ALTER TABLE public.raw_socios_negocios ALTER COLUMN "creditoDisponible" TYPE float8 USING "creditoDisponible"::float8;
ALTER TABLE public.raw_socios_negocios ALTER COLUMN "procentajeDescuentoTotal" TYPE float8 USING "procentajeDescuentoTotal"::float8;
ALTER TABLE public.raw_socios_negocios ALTER COLUMN "limiteCredito" TYPE float8 USING "limiteCredito"::float8;













CREATE SEQUENCE seq_raw_socios_negocios_direcciones START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_socios_negocios_direcciones (
	raw_socios_negocios_direcciones_id int4 NOT NULL DEFAULT nextval('seq_raw_socios_negocios_direcciones'::regclass),
	calle varchar NULL,
	ciudad varchar NULL,
	"codigoPostal" varchar NULL,
	colonia varchar NULL,
	estado varchar NULL,
	"idDireccion" varchar NULL,
	"numInterior" varchar NULL,
	pais varchar NULL,
	"tipoDir" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_socios_negocios_direcciones_pk PRIMARY KEY (raw_socios_negocios_direcciones_id)
);


ALTER TABLE public.raw_socios_negocios_direcciones ADD codigoclientepadre varchar NULL;
ALTER TABLE public.raw_socios_negocios_direcciones ADD CONSTRAINT raw_socios_negocios_direcciones_fk FOREIGN KEY (codigoclientepadre) REFERENCES public.raw_socios_negocios("codigoCliente");
ALTER TABLE public.raw_socios_negocios_direcciones RENAME COLUMN codigoclientepadre TO "codigoClientePadre";







CREATE SEQUENCE seq_raw_snpropiedades START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_snpropiedades (
	raw_snpropiedades_id int4 NOT NULL DEFAULT nextval('seq_raw_snpropiedades'::regclass),
	descripcion varchar NULL,
	propiedad varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_snpropiedades_pk PRIMARY KEY (raw_snpropiedades_id)
);























CREATE SEQUENCE seq_raw_articulos START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_articulos (
	raw_articulos_id int4 NOT NULL DEFAULT nextval('seq_raw_articulos'::regclass),
	"UMedidaVenta" varchar NULL,
	"cantidadMinimaPedido" int4 NULL,
	"cantidadMultiplePedido" int4 NULL,
	"claveProdServ" varchar NULL,
	"codigoArticulo" varchar NULL,
	"codigoBarras" varchar NULL,
	"codigoGrupo" varchar NULL,
	"codigoGrupoUM" varchar NULL,
	"codigoMarca" varchar NULL,
	"diasResurtimiento" varchar NULL,
	"estatus" varchar NULL,
	"nombreArticulo" varchar NULL,
	"nombreExtranjero" varchar NULL,
	"nombreGrupo" varchar NULL,
	"nombreGrupoUM" varchar NULL,
	"nombreMarca" varchar NULL,
	prop1 varchar NULL,
	prop10 varchar NULL,
	prop11 varchar NULL,
	prop12 varchar NULL,
	prop13 varchar NULL,
	prop14 varchar NULL,
	prop15 varchar NULL,
	prop16 varchar NULL,
	prop17 varchar NULL,
	prop18 varchar NULL,
	prop19 varchar NULL,
	prop2 varchar NULL,
	prop20 varchar NULL,
	prop21 varchar NULL,
	prop22 varchar NULL,
	prop23 varchar NULL,
	prop24 varchar NULL,
	prop25 varchar NULL,
	prop26 varchar NULL,
	prop27 varchar NULL,
	prop28 varchar NULL,
	prop29 varchar NULL,
	prop3 varchar NULL,
	prop30 varchar NULL,
	prop31 varchar NULL,
	prop32 varchar NULL,
	prop33 varchar NULL,
	prop34 varchar NULL,
	prop35 varchar NULL,
	prop36 varchar NULL,
	prop37 varchar NULL,
	prop38 varchar NULL,
	prop39 varchar NULL,
	prop4 varchar NULL,
	prop40 varchar NULL,
	prop41 varchar NULL,
	prop42 varchar NULL,
	prop43 varchar NULL,
	prop44 varchar NULL,
	prop45 varchar NULL,
	prop46 varchar NULL,
	prop47 varchar NULL,
	prop48 varchar NULL,
	prop49 varchar NULL,
	prop5 varchar NULL,
	prop50 varchar NULL,
	prop51 varchar NULL,
	prop52 varchar NULL,
	prop53 varchar NULL,
	prop54 varchar NULL,
	prop55 varchar NULL,
	prop56 varchar NULL,
	prop57 varchar NULL,
	prop58 varchar NULL,
	prop59 varchar NULL,
	prop6 varchar NULL,
	prop60 varchar NULL,
	prop61 varchar NULL,
	prop62 varchar NULL,
	prop63 varchar NULL,
	prop64 varchar NULL,
	prop7 varchar NULL,
	prop8 varchar NULL,
	prop9 varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_articulos_pk PRIMARY KEY (raw_articulos_id)
);






ALTER TABLE public.raw_articulos RENAME COLUMN estatus TO activo;











CREATE SEQUENCE seq_raw_articulos_propiedades START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_articulos_propiedades (
	raw_articulos_propiedades_id int4 NOT NULL DEFAULT nextval('seq_raw_articulos_propiedades'::regclass),
	descripcion varchar NULL,
	propiedad varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_articulos_propiedades_pk PRIMARY KEY (raw_articulos_propiedades_id)
);









CREATE SEQUENCE seq_raw_articulos_grupos START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_articulos_grupos (
	raw_articulos_grupos_id int4 NOT NULL DEFAULT nextval('seq_raw_articulos_grupos'::regclass),
	codigoGrupo varchar NULL,
	nombreGrupo varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_articulos_grupos_pk PRIMARY KEY (raw_articulos_grupos_id)
);


ALTER TABLE public.raw_articulos_grupos RENAME COLUMN codigogrupo TO "codigoGrupo";
ALTER TABLE public.raw_articulos_grupos RENAME COLUMN nombregrupo TO "nombreGrupo";









CREATE SEQUENCE seq_raw_articulos_bom START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_articulos_bom (
	raw_articulos_bom_id int4 NOT NULL DEFAULT nextval('seq_raw_articulos_bom'::regclass),
	cantidad varchar NULL,
	"codigoArticulo" varchar NULL,
	"componentes" varchar NULL,
	"nombreArticulo" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_articulos_bom_pk PRIMARY KEY (raw_articulos_bom_id)
);


ALTER TABLE public.raw_articulos_bom ADD CONSTRAINT raw_articulos_bom_un UNIQUE ("codigoArticulo");
ALTER TABLE public.raw_articulos_bom ALTER COLUMN cantidad TYPE int4 USING cantidad::int4;
ALTER TABLE public.raw_articulos_bom ADD tipo varchar NULL;




CREATE SEQUENCE seq_raw_articulos_bom_detalle START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_articulos_bom_detalle (
	raw_articulos_bom_detalle_id int4 NOT NULL DEFAULT nextval('seq_raw_articulos_bom_detalle'::regclass),
	"codigoArticulo_padre" varchar NULL,
	"NumComponente" varchar NULL,
	"cantidad" varchar NULL,
	"codigoArticulo" varchar NULL,
	"nombreArticulo" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_articulos_bom_detalle_pk PRIMARY KEY (raw_articulos_bom_detalle_id)
);

ALTER TABLE public.raw_articulos_bom_detalle ADD CONSTRAINT raw_articulos_bom_detalle_fk FOREIGN KEY ("codigoArticulo_padre") REFERENCES public.raw_articulos_bom("codigoArticulo");
ALTER TABLE public.raw_articulos_bom_detalle RENAME TO raw_articulos_bom_componentes;
ALTER TABLE public.raw_articulos_bom_componentes RENAME COLUMN raw_articulos_bom_detalle_id TO raw_articulos_bom_componentes_id;

ALTER TABLE public.raw_articulos_bom_componentes ALTER COLUMN "NumComponente" TYPE int4 USING "NumComponente"::int4;
ALTER TABLE public.raw_articulos_bom_componentes ALTER COLUMN cantidad TYPE int4 USING cantidad::int4;























CREATE SEQUENCE seq_raw_almacenes START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_almacenes (
	raw_almacenes_id int4 NOT NULL DEFAULT nextval('seq_raw_almacenes'::regclass),
	"bloqueado" varchar NULL,
	"codigoAlmacen" varchar NULL,
	"nombreAlmacen" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_almacenes_pk PRIMARY KEY (raw_almacenes_id)
);












CREATE SEQUENCE seq_raw_nombre_listas_precios START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_nombre_listas_precios (
	raw_nombre_listas_precios_id int4 NOT NULL DEFAULT nextval('seq_raw_nombre_listas_precios'::regclass),
	"codigoListaPrecios" varchar NULL,
	"factor" varchar NULL,
	"nombreListaPrecios" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_nombre_listas_precios_pk PRIMARY KEY (raw_nombre_listas_precios_id)
);



ALTER TABLE public.raw_nombre_listas_precios ALTER COLUMN factor TYPE int4 USING factor::int4;
ALTER TABLE public.raw_nombre_listas_precios ALTER COLUMN factor TYPE float4 USING factor::float4;













CREATE SEQUENCE seq_raw_listas_precios_basicas START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_listas_precios_basicas (
	raw_listas_precios_id int4 NOT NULL DEFAULT nextval('seq_raw_listas_precios_basicas'::regclass),
	"codigoArticulo" varchar NULL,
	"nombreArticulo" varchar NULL,
	"precios" varchar NULL,
	"codigoListaPrecios" varchar NULL,
	"factor" varchar NULL,
	"moneda" varchar NULL,
	"nombreListaPrecios" varchar NULL,
	"precio" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_listas_precios_pk PRIMARY KEY (raw_listas_precios_id)
);

ALTER TABLE public.raw_listas_precios_basicas ALTER COLUMN factor TYPE float4 USING factor::float4;
ALTER TABLE public.raw_listas_precios_basicas ALTER COLUMN precio TYPE float4 USING precio::float4;
ALTER TABLE public.raw_listas_precios_basicas DROP COLUMN precios;
















CREATE SEQUENCE seq_raw_inventario START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;



CREATE TABLE public.raw_inventario (
	raw_inventario_id int4 NOT NULL DEFAULT nextval('seq_raw_inventario'::regclass),
	"codigoArticulo" varchar NULL,
	"cantidad" int4 NULL,
	"codigoAlmacen" varchar NULL,
	"disponible" varchar NULL,
	"createdAt" timestamp NULL,
	"updatedAt" timestamp,
	CONSTRAINT raw_inventario_pk PRIMARY KEY (raw_inventario_id)
);









CREATE SEQUENCE seq_raw_listas_precios_periodo START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_listas_precios_periodo (
	raw_listas_precios_periodo_id int4 NOT NULL DEFAULT nextval('seq_raw_listas_precios_periodo'::regclass),
	"codigoArticulo" varchar NULL,
	"activo" varchar NULL,
	"codigoListaPrecios" varchar NULL,
	moneda varchar NULL,
	"porcentajeDescuento" float4 NULL,
	"validoDesde" varchar NULL,
	"validoHasta" varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT raw_listas_precios_periodo_pk PRIMARY KEY (raw_listas_precios_periodo_id)
);













CREATE SEQUENCE seq_raw_listas_precios_cantidad START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.raw_listas_precios_cantidad (
	raw_listas_precios_cantidad_id int4 NOT NULL DEFAULT nextval('seq_raw_listas_precios_cantidad'::regclass),
	"codigoArticulo" varchar NULL,
	"activo" varchar NULL,
	"cantidad" float4 NULL,
	"codigoListaPrecios" varchar NULL,
	moneda varchar NULL,
	"porcentajeDescuento" float4 NULL,
	"validoDesde" varchar NULL,
	"validoHasta" varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT raw_listas_precios_cantidad_pk PRIMARY KEY (raw_listas_precios_cantidad_id)
);

















CREATE SEQUENCE seq_raw_listas_precios_grupo START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;




CREATE TABLE public.raw_listas_precios_grupo (
	raw_listas_precios_grupo_id int4 NOT NULL DEFAULT nextval('seq_raw_listas_precios_grupo'::regclass),
	"activo" varchar NULL,
	"codigo" varchar NULL,
	"porcentajeDescuento" float4 NULL,
	"subCodigo" varchar NULL,
	"subTipo" varchar NULL,
	"tipo" varchar NULL,
	"validoDesde" varchar NULL,
	"validoHasta" varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT raw_listas_precios_grupo_pk PRIMARY KEY (raw_listas_precios_grupo_id)
);






CREATE SEQUENCE seq_raw_listas_precios_especiales START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;




CREATE TABLE public.raw_listas_precios_especiales (
	raw_listas_precios_especiales_id int4 NOT NULL DEFAULT nextval('seq_raw_listas_precios_especiales'::regclass),
	"codigoSocioNegocio" varchar NULL,
	"activo" varchar NULL,
	"codigoArticulo" varchar NULL,
	"codigoListaPrecios" varchar NULL,
	"moneda" varchar NULL,
	"porcentajeDescuento" float4 NULL,
	"validoDesde" varchar NULL,
	"validoHasta" varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT raw_listas_precios_especiales_pk PRIMARY KEY (raw_listas_precios_especiales_id)
);








CREATE SEQUENCE seq_raw_inventario_detalle START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_inventario_detalle (
	raw_inventario_detalle_id int4 NOT NULL DEFAULT nextval('seq_raw_inventario_detalle'::regclass),
	"codigoAlmacen" varchar NULL,
	"codigoArticulo" varchar NULL,
	"codigoLote" varchar NULL,
	"nombreLote" varchar NULL,
	"ubicaciones" varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT raw_inventario_detalle_pk PRIMARY KEY (raw_inventario_detalle_id)
);




CREATE SEQUENCE seq_raw_inventario_detalle_ubicacion START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.raw_inventario_detalle_ubicacion (
	raw_inventario_detalle_ubicacion_id int4 NOT NULL DEFAULT nextval('seq_raw_inventario_detalle_ubicacion'::regclass),
	"codigoAlmacen" varchar NULL,
	"codigoArticulo" varchar NULL,
	"codigoLote" varchar NULL,
	"cantidad" int4 NULL,
	"codigoUbicacion" varchar NULL,
	"disponible" int4 NULL,
	"nombreUbicacion" varchar NULL,
	"createdAt" timestamp(0) NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT raw_inventario_detalle_ubicacion_pk PRIMARY KEY (raw_inventario_detalle_ubicacion_id)
);















ALTER TABLE public.socios_negocio_direcciones ADD iddireccion varchar NULL;
ALTER TABLE public.socios_negocio_direcciones RENAME COLUMN iddireccion TO "idDireccion";
ALTER TABLE public.socios_negocio_direcciones RENAME COLUMN "idDireccion" TO "snd_idDireccion";

ALTER TABLE public.socios_negocio_direcciones ADD snd_codigo_postal varchar NULL;
ALTER TABLE public.socios_negocio_direcciones ADD tipodir varchar NULL;
ALTER TABLE public.socios_negocio_direcciones RENAME COLUMN tipodir TO "snd_tipoDir";

ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_direccion_num_int TYPE varchar USING snd_direccion_num_int::varchar;
ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_direccion_num_ext TYPE varchar USING snd_direccion_num_ext::varchar;
ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_direccion_telefono TYPE varchar USING snd_direccion_telefono::varchar;



ALTER TABLE public.raw_socios_negocios RENAME COLUMN estatus TO activo;
ALTER TABLE public.socios_negocio ALTER COLUMN sn_email_facturacion TYPE varchar USING sn_email_facturacion::varchar;
ALTER TABLE public.socios_negocio ALTER COLUMN sn_direccion_facturacion TYPE varchar USING sn_direccion_facturacion::varchar;





ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_direccion TYPE varchar USING snd_direccion::varchar;
ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_calle1 TYPE varchar USING snd_calle1::varchar;
ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_calle2 TYPE varchar USING snd_calle2::varchar;
ALTER TABLE public.socios_negocio_direcciones ALTER COLUMN snd_ciudad TYPE varchar USING snd_ciudad::varchar;


ALTER TABLE public.raw_articulos_bom ALTER COLUMN cantidad TYPE float4 USING cantidad::float4;
ALTER TABLE public.raw_articulos_bom_componentes ALTER COLUMN cantidad TYPE float4 USING cantidad::float4;





ALTER TABLE public.almacenes ADD alm_codigoalmacen varchar NULL;
ALTER TABLE public.almacenes RENAME COLUMN alm_codigoalmacen TO "alm_codigoAlmacen";









CREATE SEQUENCE seq_cat_categoria_id_start_one_million START WITH 1000000 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.categorias ALTER COLUMN cat_categoria_id SET DEFAULT nextval('seq_cat_categoria_id_start_one_million'::regclass);


CREATE SEQUENCE seq_cat_marcas_id_start_one_million START WITH 1000000 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER TABLE public.marcas ALTER COLUMN mar_marca_id SET DEFAULT nextval('seq_cat_marcas_id_start_one_million'::regclass);

 

 













