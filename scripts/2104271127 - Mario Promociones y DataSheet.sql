-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/04/27 
-- Description:	 Mario Promociones y DataSheet 
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
ALTER TABLE public.elementos_promocion
    ADD COLUMN ep_prod_producto_id integer;
ALTER TABLE public.elementos_promocion
    ADD CONSTRAINT producto_id FOREIGN KEY (ep_prod_producto_id)
    REFERENCES public.productos (prod_producto_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


--Data Sheet Producto
CREATE SEQUENCE seq_pds_producto_data_sheet_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_data_sheet
(
    pds_producto_data_sheet_id integer NOT NULL DEFAULT nextval('seq_pds_producto_data_sheet_id'::regclass),
    pds_prod_producto_id integer NOT NULL,
    pds_nombre_data_sheet character varying(800) NOT NULL,
    pds_ruta_archivo character varying(1000) NOT NULL,
    pds_usu_usuario_creador_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    CONSTRAINT producto_data_sheet_id PRIMARY KEY (pds_producto_data_sheet_id),
    CONSTRAINT usuario_creador_id FOREIGN KEY (pds_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (pds_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.productos_data_sheet
    OWNER to postgres;