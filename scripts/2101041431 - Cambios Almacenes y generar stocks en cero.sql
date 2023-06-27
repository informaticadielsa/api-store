-- ============================================= 
-- Author:		HENRY MIRHAIL KISHI SALINAS 
-- Create date: 2021/01/04 
-- Description:	Agregar columna en almacenes y stock productos y trigger de generar productos por almacen al crear nuevo almacen 
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



INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000057,
    'TIPO_ALMACEN',
    'FISICO',
    TRUE,
    TRUE,
    1,
    current_date
);


INSERT INTO public.controles_maestros_multiples
(
    cmm_control_id,
    cmm_nombre,
    cmm_valor,
    cmm_sistema,
    cmm_activo,
    cmm_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    1000058,
    'TIPO_ALMACEN',
    'VIRTUAL',
    TRUE,
    TRUE,
    1,
    current_date
);









--Crea la columna de tipo de almacenes
ALTER TABLE public.almacenes ADD alm_tipo_almacen int4 NULL;



ALTER TABLE public.stocks_productos ADD sp_almacen_id int4 NULL;
ALTER TABLE public.stocks_productos ADD CONSTRAINT stocks_productos FOREIGN KEY (sp_almacen_id) REFERENCES public.almacenes(alm_almacen_id);











--CREAR FUNCION PARA INSERTAR EL STOCK
CREATE OR REPLACE FUNCTION public.fn_insert_almacenes_to_stock_product() 
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE 

alm_max_id INTEGER := (select max(alm_almacen_id) from public.almacenes);
r record;

BEGIN


	FOR r IN select prod_producto_id, prod_sku from public.productos where prod_prod_producto_padre_sku != ''
	loop
	
		insert into public.stocks_productos
		(
			sp_prod_producto_id,
			sp_fecha_ingreso,
			sp_cantidad,
			sp_usu_usuario_creador_id,
			"createdAt",
			sp_almacen_id
		)
		values
		(
			(row_to_json(r)->>'prod_producto_id')::integer,
			now(),
			0,
			1,
			now(),
			alm_max_id
		);
	END LOOP;
	

RETURN NULL;

END;
$function$
;






CREATE trigger tg_new_products_stocks_from_almacenes after
insert
    on
    public.almacenes for each row execute function fn_insert_almacenes_to_stock_product();

   
   
   

-- ALTER TABLE public.stocks_productos DROP CONSTRAINT producto_id;
-- ALTER TABLE public.stocks_productos ADD CONSTRAINT "stockProd-Productos" FOREIGN KEY (sp_prod_producto_id) REFERENCES public.productos(prod_producto_id);


















