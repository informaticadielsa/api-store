-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/12/15 
-- Description:	 Roles para socios de negocio 
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
	1000054,
	'TIPO_ROL_MENU',
	'ADMINISTRADOR',
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
	1000055,
	'TIPO_ROL_MENU',
	'SOCIO_DE_NEGOCIO',
	true,
	true,
	1,
	current_date
);


ALTER TABLE public.roles
    ADD COLUMN rol_tipo_rol_id integer NOT NULL DEFAULT 1000054;


ALTER TABLE roles ADD CONSTRAINT fk_tipo_rol
FOREIGN KEY (rol_tipo_rol_id) REFERENCES controles_maestros_multiples(cmm_control_id);

ALTER TABLE public.menus
    ADD COLUMN mn_tipo_menu_id integer NOT NULL DEFAULT 1000054;
    
ALTER TABLE menus ADD CONSTRAINT fk_tipo_menu
FOREIGN KEY (mn_tipo_menu_id) REFERENCES controles_maestros_multiples(cmm_control_id);


------------------ Cambio en roles menu

--TRIGGER FOR INSERT IN MENU
CREATE OR REPLACE FUNCTION fn_new_menu()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN
	FOR r IN SELECT * FROM roles where rol_tipo_rol_id = NEW.mn_tipo_menu_id
	LOOP
		INSERT INTO roles_permisos(
			rol_per_rol_rol_id,
			rol_per_mu_menu_id,
			rol_per_ver,
			rol_per_editar,
			rol_per_crear,
			rol_per_eliminar,
            "createdAt"
		)VALUES(
			(row_to_json(r)->>'rol_rol_id')::integer, 
			NEW.mn_menu_id,  
			false, 
			false, 
			false, 
			false, 
			current_date
		);
	END LOOP;

RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE;


---- CREAMOS EL ROL
CREATE OR REPLACE FUNCTION fn_insert_rol()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM menus where mn_tipo_menu_id = NEW.rol_tipo_rol_id
	LOOP
		INSERT INTO roles_permisos(
			rol_per_rol_rol_id,
			rol_per_mu_menu_id,
			rol_per_ver,
			rol_per_editar,
			rol_per_crear,
			rol_per_eliminar,
            "createdAt"
		)VALUES(
			NEW.rol_rol_id,  
			(row_to_json(r)->>'mn_menu_id')::integer, 
			false, 
			false, 
			false, 
			false, 
			current_date
		);
	END LOOP;

RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE; 


  
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
	'Usuarios socios de negocios',
	'/usuarios_socios_negocio',
	1000004,
	1,
	current_date,
    1000055
);