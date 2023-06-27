-- ============================================= 
-- Author:		Henry Kishi 
-- Create date: 2021/05/25 
-- Description:	 productos relacionados accesorios colecciones 
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




--se agregaron columnas para la relacion en la tabla productos
ALTER TABLE public.productos ADD prod_productos_coleccion_relacionados_id int4 NULL;
ALTER TABLE public.productos ADD prod_productos_coleccion_accesorios_id int4 NULL;

ALTER TABLE public.productos ADD CONSTRAINT prod_relacionados_colecciones FOREIGN KEY (prod_productos_coleccion_relacionados_id) REFERENCES public.colecciones(col_coleccion_id);
ALTER TABLE public.productos ADD CONSTRAINT prod_accesorios_colecciones FOREIGN KEY (prod_productos_coleccion_accesorios_id) REFERENCES public.colecciones(col_coleccion_id);



insert into controles_maestros_multiples ( 
	cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
	1000167,
	'TIPO_COLECCION',
	'ACCESORIOS',
	true,
	true,
	1,
	current_date
);



















	