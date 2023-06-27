-- ============================================= 
-- Author:		DESKTOP-ARAE8GA 
-- Create date: 2023/01/27 
-- Description:	 edurdo file upload 
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
-- public.orden_de_compra definition

-- Drop table

-- DROP TABLE public.orden_de_compra;

CREATE TABLE public.orden_de_compra (
    odc_orden_de_compra_id serial4 NOT null,
    odc_carrito_de_compra_id int4 NOT NULL,
    odc_nombre_archivo varchar(800) NOT NULL,
    odc_ruta_archivo varchar(1000) NOT NULL,
    odc_usu_usuario_creador_id int4 NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NULL,
    CONSTRAINT orden_de_compra_id PRIMARY KEY (odc_orden_de_compra_id)
);


-- public.orden_de_compra foreign keys

ALTER TABLE public.orden_de_compra ADD CONSTRAINT cart_id FOREIGN KEY (odc_carrito_de_compra_id) REFERENCES public.carrito_de_compras(cdc_carrito_de_compra_id);
ALTER TABLE public.orden_de_compra ADD CONSTRAINT usuario_creador_id FOREIGN KEY (odc_usu_usuario_creador_id) REFERENCES public.usuarios(usu_usuario_id);