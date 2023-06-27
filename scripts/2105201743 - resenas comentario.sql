-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/20 
-- Description:	 reseñas comentario 
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















CREATE SEQUENCE seq_rep_resenas_productos_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;


CREATE TABLE public.resenas_productos (
	rep_resenas_productos_id int4 NOT NULL DEFAULT nextval('seq_rep_resenas_productos_id'::regclass),
	rep_prod_producto_id int4 NOT NULL,
	rep_usu_usuario_id int4 NOT NULL,
	rep_calificacion int4 NOT NULL,
	rep_comentario varchar NULL,
	rep_aprobado bool NULL DEFAULT false,
	rep_usu_usuario_creador_id int4 NOT NULL,
	"createdAt" timestamp(0) NULL,
	rep_usu_usuario_modificador_id int4 NULL,
	"updatedAt" timestamp(0) NULL,
	CONSTRAINT resenas_productos_pk PRIMARY KEY (rep_resenas_productos_id),
	CONSTRAINT usuarios_fk FOREIGN KEY (rep_usu_usuario_id) REFERENCES public.usuarios(usu_usuario_id),
	CONSTRAINT producto_fk FOREIGN KEY (rep_prod_producto_id) REFERENCES public.productos(prod_producto_id)
);




ALTER TABLE public.productos ADD prod_calificacion_promedio float4 NULL;










CREATE or replace FUNCTION fn_update_resenas_promedio_from_product () 
RETURNS TRIGGER 
AS $$
DECLARE rew float;
declare totalCount int;
  begin
	 
	IF (TG_OP = 'UPDATE') then
		
		SELECT avg(rep_calificacion) from resenas_productos rp where rep_prod_producto_id = NEW.rep_prod_producto_id and rep_aprobado = true into rew;

		UPDATE productos SET prod_calificacion_promedio = rew where prod_producto_id = new.rep_prod_producto_id;
	    RETURN NEW;
	   
    END IF;
    
  END; 
  $$ LANGUAGE plpgsql;



 
 

CREATE TRIGGER update_promedio_calificacion 
AFTER UPDATE ON resenas_productos
FOR EACH ROW
WHEN (new.rep_aprobado = true or new.rep_aprobado= false)
EXECUTE PROCEDURE fn_update_resenas_promedio_from_product();

















