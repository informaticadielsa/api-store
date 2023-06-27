-- ============================================= 
-- Author:		DESKTOP-8TJ4F6S 
-- Create date: 2022/11/15 
-- Description:	 crear 404 por default y agregar usuario SN a la compra finalizada 
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
INSERT INTO public.paginas_institucionales
(
    pi_nombre_seccion, 
    pi_contenido_html, 
    pi_usu_usuario_creador_id, 
    pi_usu_usuario_modificador_id, 
    "createdAt", 
    "updatedAt", 
    pi_cmm_status_id, 
    pi_seccion_cmm
)
VALUES(
    'Error 404', 
    '[{"id":1,"type":"title","contenido":"Uppss estás un poco perdido"},{"id":2,"type":"paragraph","contenido":"<p>Nos da mucha pena pero eta es un error por favor regresa a la paguina princia</p>"},{"id":3,"type":"link","contenido":"Paguina principal","url":"store.dielsa.com"}]', 
    1, 
    105, 
    '2021-12-29 09:34:45.000', 
    '2022-09-21 11:10:41.000', 
    1000151, 
    NULL
);





ALTER TABLE public.compras_finalizadas ADD cf_snu_usuario_snu_id int4 NULL;
