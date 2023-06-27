-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/05/06 
-- Description:	 Mario Restructura metas usuarios 
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


drop table metas_usuario_vendedor ;

CREATE SEQUENCE seq_mv_meta_vendedor_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.metas_vendedor
(
    mv_meta_vendedor_id integer NOT NULL DEFAULT nextval('seq_mv_meta_vendedor_id'::regclass),
    mv_met_meta_id integer NOT NULL,
    mv_usu_usuario_id integer NOT NULL,
    mv_cuota double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone,
    mv_cmm_status_id integer NOT NULL,
    PRIMARY KEY (mv_meta_vendedor_id),
    CONSTRAINT meta_id FOREIGN KEY (mv_met_meta_id)
        REFERENCES public.metas_equipo_trabajo (met_meta_equipo_trabajo_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT vendedor_id FOREIGN KEY (mv_usu_usuario_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT status_meta FOREIGN KEY (mv_cmm_status_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.metas_vendedor
    OWNER to postgres;



    
--Crear una nueva meta de equipo de trabajo
CREATE OR REPLACE FUNCTION fn_create_meta_usuario_when_new_meta_equipo()
  RETURNS trigger AS
$BODY$
DECLARE r record;
begin
    FOR r IN select * from usuarios_equipo_de_trabajo uedt where uedt_et_equipo_de_trabajo_id  = NEW.met_et_equipo_trabajo_id
	LOOP
		INSERT INTO metas_vendedor(
            mv_met_meta_id,
            mv_usu_usuario_id,
            mv_cuota,
            "createdAt",
            mv_cmm_status_id
		)VALUES(
			NEW.met_meta_equipo_trabajo_id,  
			(row_to_json(r)->>'uedt_usu_usuario_id')::integer, 
			0, 
			current_date,
            1000022
		);
	END LOOP; 
RETURN NULL;

END;
$BODY$
  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER new_meta_for_user
  AFTER INSERT
  ON metas_equipo_trabajo
  FOR EACH ROW
  EXECUTE PROCEDURE fn_create_meta_usuario_when_new_meta_equipo();
