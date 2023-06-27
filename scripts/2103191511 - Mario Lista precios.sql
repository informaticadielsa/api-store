-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/19 
-- Description:	 Mario Lista precios 
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
ALTER TABLE public.productos DROP COLUMN prod_lista_precio;

CREATE SEQUENCE seq_pl_producto_lista_precio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_lista_de_precio
(
    pl_producto_lista_precio_id INTEGER NOT NULL DEFAULT nextval('seq_pl_producto_lista_precio_id'::regclass),
    pl_prod_producto_id integer NOT NULL,
    pl_listp_lista_de_precio_id integer NOT NULL,
    pl_precio_producto double precision NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (pl_producto_lista_precio_id),
    CONSTRAINT producto FOREIGN KEY (pl_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT lista_precio FOREIGN KEY (pl_listp_lista_de_precio_id)
        REFERENCES public.listas_de_precios (listp_lista_de_precio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.productos_lista_de_precio
    OWNER to postgres;

ALTER TABLE public.productos_lista_de_precio
    ADD CONSTRAINT unica_lista_producto UNIQUE (pl_prod_producto_id, pl_listp_lista_de_precio_id);


------------------- Crea relación entre productos y lista de precios al incertar productos
CREATE OR REPLACE FUNCTION fn_new_product_in_lista_precio()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM listas_de_precios  where listp_cmm_estatus_id != 1000041
	LOOP
		INSERT INTO productos_lista_de_precio(
            pl_prod_producto_id,
            pl_listp_lista_de_precio_id,
            pl_precio_producto,
            "createdAt"
		)VALUES(
			NEW.prod_producto_id,
            (row_to_json(r)->>'listp_lista_de_precio_id')::integer,
            0,
			current_date
		);
	END LOOP;

RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER new_producto_in_producto_to_lista_precios
  AFTER INSERT
  ON productos
  FOR EACH ROW
  EXECUTE PROCEDURE fn_new_product_in_lista_precio();

----------------------- Creamos relación entre productos y lista de precios al crear una lista 
CREATE OR REPLACE FUNCTION fn_new_lista_precio_to_producto()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM productos where prod_prod_producto_padre_sku  is not null and prod_cmm_estatus_id  != 1000018
	LOOP
		INSERT INTO productos_lista_de_precio(
            pl_prod_producto_id,
            pl_listp_lista_de_precio_id,
            pl_precio_producto,
            "createdAt"
		)VALUES(
            (row_to_json(r)->>'prod_producto_id')::integer,
			NEW.listp_lista_de_precio_id,
            0,
			current_date
		);
	END LOOP;

RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER new_producto_in_producto_to_lista_precios
  AFTER INSERT
  ON listas_de_precios
  FOR EACH ROW
  EXECUTE PROCEDURE fn_new_lista_precio_to_producto();


  
update socios_negocio  set sn_lista_precios = null;
ALTER TABLE socios_negocio ADD CONSTRAINT fk_lista_precio
 FOREIGN KEY (sn_lista_precios) REFERENCES listas_de_precios(listp_lista_de_precio_id);

--- Insertamos los registros existentes 

insert into productos_lista_de_precio ( 
	pl_prod_producto_id,
	pl_listp_lista_de_precio_id,
	pl_precio_producto,
	"createdAt"
)
select 
	p.prod_producto_id,
	ldp.listp_lista_de_precio_id,
	0,
	current_date
from productos p
cross join listas_de_precios ldp
where prod_prod_producto_padre_sku  is not null and prod_cmm_estatus_id  != 1000018;


---- NUEVO MENU
  
insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Asignación de socios de negocio',
	'/sellers',
	1000004,
	1,
	current_date,
    1000054
);


