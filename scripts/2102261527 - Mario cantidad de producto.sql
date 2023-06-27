-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/02/26 
-- Description:	 Mario cantidad de producto 
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
insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
	mn_tipo_menu_id
)
values
(
	'Lista de compras',
	'/quoteslist',
	1000004,
	1,
	current_date,
	1000054
);

ALTER TABLE public.productos_cotizaciones
    ADD COLUMN pc_cantidad_producto integer;

ALTER TABLE public.almacenes
    ALTER COLUMN alm_tipo_almacen SET DEFAULT 1000057;

ALTER TABLE public.almacenes
    ALTER COLUMN alm_tipo_almacen SET NOT NULL;

	
ALTER TABLE almacenes ADD CONSTRAINT alm_tipo_almacen
FOREIGN KEY (alm_tipo_almacen) REFERENCES controles_maestros_multiples(cmm_control_id);

--Descuento por marca
ALTER TABLE public.marcas
    ADD COLUMN mar_descuento integer NOT NULL DEFAULT 0;

--Descuento por producto
ALTER TABLE public.productos
    ADD COLUMN prod_descuento integer NOT NULL DEFAULT 0;

--Descuento por socio de negocio
ALTER TABLE public.socios_negocio
    ADD COLUMN sn_descuento integer NOT NULL DEFAULT 0;


-- Relacion gerentes socios_negocio
CREATE SEQUENCE seq_gs_gerente_socio_negocio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.gerentes_socios_de_negocio
(
    gs_gerente_socio_negocio_id  integer NOT NULL DEFAULT nextval('seq_gs_gerente_socio_negocio_id'::regclass),
    gs_gerente_id integer NOT NULL,
    gs_socio_negocio_id integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" time with time zone,
    gs_usu_usuario_creador_id integer NOT NULL,
    gs_usu_usuario_modificado_por_id integer,
    PRIMARY KEY (gs_gerente_socio_negocio_id),
    CONSTRAINT gerente FOREIGN KEY (gs_gerente_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT socio_negocio_id FOREIGN KEY (gs_socio_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_creador_id FOREIGN KEY (gs_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificado_id FOREIGN KEY (gs_usu_usuario_modificado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.gerentes_socios_de_negocio
    OWNER to postgres;

ALTER TABLE public.gerentes_socios_de_negocio
    ADD CONSTRAINT gerente_socio_unico UNIQUE (gs_gerente_id, gs_socio_negocio_id);



--Crea una nueva asociación entre gerente y socio de negocio
CREATE OR REPLACE FUNCTION fn_create_new_relation()
  RETURNS trigger AS
$BODY$
DECLARE r record;
begin
	if ((select count(gs_gerente_socio_negocio_id) from gerentes_socios_de_negocio where gs_gerente_id = (select usu_usuario_creado_por_id from usuarios where usu_usuario_id = NEW.usn_usu_usuario_id) and 
		gs_socio_negocio_id = NEW.usn_sn_socio_de_negocio_id) <= 0) then
		INSERT INTO gerentes_socios_de_negocio(
			gs_gerente_id,
			gs_socio_negocio_id,
			"createdAt",
			gs_usu_usuario_creador_id
		)VALUES(
			(select usu_usuario_creado_por_id from usuarios where usu_usuario_id = NEW.usn_usu_usuario_id),
			NEW.usn_sn_socio_de_negocio_id,
	        current_date,
	        NEW.usn_usu_usuario_asignado_por_id
		);
	end if;
RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER new_relation_socio_negocio
  AFTER INSERT
  ON usuarios_socios_de_negocio
  FOR EACH ROW
  EXECUTE PROCEDURE fn_create_new_relation();

--Elimina asignación de un gerente 
--	CREATE OR REPLACE FUNCTION fn_delete_socio_in_gerente()
--	  RETURNS trigger AS
--	$BODY$
--	DECLARE r record;
--	begin
--		FOR r IN select * from usuarios u  where usu_usuario_creado_por_id = new.gs_gerente_id
--		LOOP
--			delete from usuarios_socios_de_negocio where usn_usu_usuario_id = (row_to_json(r)->>'usu_usuario_id')::integer;
--		END LOOP;
--	RETURN NULL;
--	
--	END;
--	$BODY$
--	  LANGUAGE plpgsql VOLATILE;
--	
--	CREATE TRIGGER delete_relation_gerente
--	  AFTER DELETE
--	  ON usuarios_socios_de_negocio
--	  FOR EACH ROW
--	  EXECUTE PROCEDURE fn_delete_socio_in_gerente();


--Credito del cliente 
ALTER TABLE public.socios_negocio
ADD COLUMN sn_credito_disponible double precision NOT NULL DEFAULT 0;


insert into controles_maestros_multiples (
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	9,
	'TIPO_COMPRA',
	'Transferencia',
	false,
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
	10,
	'TIPO_COMPRA',
	'Tarjeta Crédito/Débito',
	false,
	true,
	1,
	current_date
);

ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_comentario character varying;

ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_descuento integer;

ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_correo_electronico character varying;

ALTER TABLE public.socios_negocio
    ALTER COLUMN sn_cardcode DROP NOT NULL;

insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000086,
	'ESTATUS_SOCIOS_NEGOCIO',
	'PENDIENTE',
	true,
	true,
	1,
	current_date
);