-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2020/10/27 
-- Description:	Create Menu 
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
CREATE SEQUENCE seq_mn_menu_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.menus(
    mn_menu_id INTEGER NOT NULL DEFAULT nextval('seq_mn_menu_id'::regclass),
    mn_nombre character varying(150) NOT NULL,
    mn_ruta character varying(150) NOT NULL,
    mn_cmm_estatus_id integer NOT NULL,
    mn_usu_usuario_creado_por_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    mn_usu_usuario_modificado_id integer,
    "updatedAt" timestamp,
    PRIMARY KEY (mn_menu_id),
    CONSTRAINT fk_mn_cm_estado_id FOREIGN KEY (mn_cmm_estatus_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_mn_usu_usuario_creador_id FOREIGN KEY (mn_usu_usuario_creado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_mn_usu_usuario_modificado_id FOREIGN KEY (mn_usu_usuario_modificado_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.menus
    OWNER to postgres;


CREATE SEQUENCE seq_rol_per_roles_permisos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.roles_permisos
(
    rol_per_roles_permisos_id integer NOT NULL DEFAULT nextval('seq_rol_per_roles_permisos_id'::regclass),
    rol_per_rol_rol_id integer NOT NULL,
    rol_per_mu_menu_id integer NOT NULL,
    rol_per_ver boolean NOT NULL,
    rol_per_editar boolean NOT NULL,
    rol_per_crear boolean NOT NULL,
    rol_per_eliminar boolean NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (rol_per_roles_permisos_id),
    CONSTRAINT fk_rol_rol_id FOREIGN KEY (rol_per_rol_rol_id)
        REFERENCES public.roles (rol_rol_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_mn_menu_id FOREIGN KEY (rol_per_mu_menu_id)
        REFERENCES public.menus (mn_menu_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.roles_permisos
    OWNER to postgres;


--TRIGGER FOR INSERT IN MENU
CREATE OR REPLACE FUNCTION fn_new_menu()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM roles
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

CREATE TRIGGER new_menu_insert_in_rol
  AFTER INSERT
  ON menus
  FOR EACH ROW
  EXECUTE PROCEDURE fn_new_menu();


INSERT INTO menus
(
    mn_nombre,
    mn_ruta,
    mn_cmm_estatus_id,
    mn_usu_usuario_creado_por_id,
    "createdAt"
)VALUES(
    'Prueba',
    '/Prueba',
    1000004,
    1,
    current_date
);

--Insert nuevo rol

--TRIGGER FOR INSERT IN MENU
CREATE OR REPLACE FUNCTION fn_insert_rol()
  RETURNS trigger AS
$BODY$
DECLARE r record;
BEGIN

	FOR r IN SELECT * FROM menus
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

CREATE TRIGGER new_rol_insert_in_menu
  AFTER INSERT
  ON roles
  FOR EACH ROW
  EXECUTE PROCEDURE fn_insert_rol();

  --INSERTAMOS NUEVO ROL
INSERT INTO public.roles
(
    rol_nombre,
    rol_descripcion,
    rol_cmm_estatus,
    rol_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    'Prueba',
    'Solo probaremos los roles',
	1000007,
	1,
    current_date
);
