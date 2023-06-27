-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/02/17 
-- Description:	 Mario Cotizaciones y proyectos [Mejoras] 
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

insert into controles_maestros_multiples (
  cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	8,
  'PROYECTOS_CONTROL_CANTIDAD',
	15000,
	false,
	true,
	1,
	current_date
);

delete from stocks_productos;

ALTER TABLE public.stocks_productos
    ADD CONSTRAINT almacen_producto_unico UNIQUE (sp_prod_producto_id, sp_almacen_id);

    
insert into stocks_productos ( 
	sp_prod_producto_id,
	sp_fecha_ingreso,
	sp_cantidad,
	sp_usu_usuario_creador_id,
	"createdAt",
	sp_almacen_id
)
select 
	p.prod_producto_id,
	current_date,
	0,
	1,
	current_date,
	alm.alm_almacen_id
from productos p
cross join almacenes alm
where prod_prod_producto_padre_sku  is not null and prod_cmm_estatus_id  != 1000018;

--AL insertar producto creamos el pivote con los almacenes
CREATE OR REPLACE FUNCTION fn_new_producto()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM almacenes
	LOOP
		INSERT INTO stocks_productos(
            sp_prod_producto_id,
            sp_fecha_ingreso,
            sp_cantidad,
            sp_usu_usuario_creador_id,
            "createdAt",
            sp_almacen_id
		)VALUES(
			NEW.prod_producto_id,
            current_date,
            0,
            NEW.prod_usu_usuario_creado_id,
			current_date,
			(row_to_json(r)->>'alm_almacen_id')::integer
		);
	END LOOP;

RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER new_producto_in_producto
  AFTER INSERT
  ON productos
  FOR EACH ROW
  EXECUTE PROCEDURE fn_new_producto();


  
--AL insertar producto creamos el pivote con los almacenes
CREATE OR REPLACE FUNCTION fn_create_new_almacen()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM productos where prod_prod_producto_padre_sku  is not null and prod_cmm_estatus_id  != 1000018
	LOOP
		INSERT INTO stocks_productos(
            sp_prod_producto_id,
            sp_fecha_ingreso,
            sp_cantidad,
            sp_usu_usuario_creador_id,
            "createdAt",
            sp_almacen_id
		)VALUES(
			(row_to_json(r)->>'prod_producto_id')::integer,
            current_date,
            0,
            NEW.alm_usu_usuario_creador_id,
			current_date,
			NEW.alm_almacen_id
		);
	END LOOP;

RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER new_almacen_in_almacen
  AFTER INSERT
  ON almacenes
  FOR EACH ROW
  EXECUTE PROCEDURE fn_create_new_almacen();


  ---TIPO DE IMPUESTO
  
insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000084,
	'TIPO_IMPUESTO',
	'8%',
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
	1000085,
	'TIPO_IMPUESTO',
	'16%',
	true,
	true,
	1,
	current_date
);



ALTER TABLE public.socios_negocio
    ADD COLUMN sn_cmm_tipo_impuesto integer NOT NULL DEFAULT 1000085;
ALTER TABLE socios_negocio ADD CONSTRAINT tipo_impuesto_id
FOREIGN KEY (sn_cmm_tipo_impuesto) REFERENCES controles_maestros_multiples(cmm_control_id);