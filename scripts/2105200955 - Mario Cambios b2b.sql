-- ============================================= 
-- Author:		Hernán Gómez  
-- Create date: 2021/05/20 
-- Description:	 Mario Cambios b2b 
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
ALTER TABLE public.socios_negocio_usuario
    ALTER COLUMN snu_cardcode DROP NOT NULL;

ALTER TABLE public.socios_negocio_usuario
    ADD COLUMN snu_sn_socio_de_negocio_id integer;
ALTER TABLE public.socios_negocio_usuario DROP CONSTRAINT socios_negocio_usuario_cardcode_snu;

ALTER TABLE public.socios_negocio_usuario
    ADD CONSTRAINT socio_de_negocio_id FOREIGN KEY (snu_sn_socio_de_negocio_id)
    REFERENCES public.socios_negocio (sn_socios_negocio_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE public.socios_negocio
    ADD COLUMN sn_datos_b2b character varying;


ALTER TABLE public.socios_negocio_direcciones
    ALTER COLUMN snd_cardcode DROP NOT NULL;

ALTER TABLE public.socios_negocio_direcciones
    ADD COLUMN snd_sn_socio_de_negocio_id integer;
ALTER TABLE public.socios_negocio_direcciones DROP CONSTRAINT socios_negocios_direcciones_fka_cardcode_snd;

ALTER TABLE public.socios_negocio_direcciones
    ADD CONSTRAINT socio_negocio_id FOREIGN KEY (snd_sn_socio_de_negocio_id)
    REFERENCES public.socios_negocio (sn_socios_negocio_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


    
insert into roles (rol_nombre, rol_descripcion, rol_cmm_estatus, rol_usu_usuario_creado_por_id, "createdAt", rol_tipo_rol_id)
values ('Administrador', 'Administrador de socios de negocio', 1000007, 1, current_date, 1000055);



------------- Cambiamos esto 
ALTER TABLE public.socios_negocio DROP COLUMN sn_datos_b2b;

ALTER TABLE public.socios_negocio
    ADD COLUMN sn_datos_b2b json;

ALTER TABLE public.socios_negocio_usuario
    ADD CONSTRAINT correo_unico UNIQUE (snu_correo_electronico);

ALTER TABLE public.socios_negocio_usuario
    ADD CONSTRAINT nombre_usuario UNIQUE (snu_usuario);