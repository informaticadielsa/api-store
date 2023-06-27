-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/06/21 
-- Description:	 Mario agregar_back_order_y_grupo_carritos 
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
--------- Agregamos referencia de almacen, para el producto
ALTER TABLE public.productos_carrito_de_compra
    ADD COLUMN pcdc_almacen_surtido integer;
ALTER TABLE public.productos_carrito_de_compra
    ADD CONSTRAINT almacen_producto FOREIGN KEY (pcdc_almacen_surtido)
    REFERENCES public.almacenes (alm_almacen_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;
ALTER TABLE public.productos_carrito_de_compra
    ADD COLUMN pcdc_no_disponible_para_compra boolean NOT NULL DEFAULT false;
ALTER TABLE public.productos_carrito_de_compra
    ADD COLUMN pcdc_back_order boolean NOT NULL DEFAULT false;
ALTER TABLE public.productos_carrito_de_compra
    ADD COLUMN pcdc_validado boolean NOT NULL DEFAULT false;
-----Referencia de almacenes virtuales pertenecientes a un fisico

ALTER TABLE public.almacenes
    ADD COLUMN alm_fisico integer;
ALTER TABLE public.almacenes
    ADD CONSTRAINT almacen_fisico FOREIGN KEY (alm_fisico)
    REFERENCES public.almacenes (alm_almacen_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


------------------- Producto back order ---------------------
ALTER TABLE public.productos
    ADD COLUMN prod_disponible_backorder boolean NOT NULL DEFAULT false;

ALTER TABLE public.cotizaciones_proyectos
    ALTER COLUMN cot_usu_usuario_vendedor_id DROP NOT NULL;