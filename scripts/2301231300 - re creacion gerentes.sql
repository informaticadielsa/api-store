-- ============================================= 
-- Author:		DESKTOP-ARAE8GA 
-- Create date: 2023/01/23 
-- Description:	 re creacion gerentes 
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
INSERT INTO public.controles_maestros_multiples
(cmm_control_id, cmm_nombre, cmm_valor, cmm_sistema, cmm_activo, cmm_usu_usuario_creado_por_id, "createdAt", cmm_usu_usuario_modificado_por_id, "updatedAt")
VALUES(1000202, 'TIPO_ROL_MENU', 'GERENTES', true, true, 1, '2022-02-11 00:00:00.000', NULL, NULL);





--Corregimos los roles, para Gerentes y vendedores
update roles
set 
rol_tipo_rol_id = 1000202
where rol_rol_id  = (select rol_rol_id from  roles where rol_nombre = 'Gerente');


ALTER TABLE public.usuarios ADD usu_vendedor_gerente int4 NULL;
COMMENT ON COLUMN public.usuarios.usu_vendedor_gerente IS 'Campo que relacion id usuario vendedor con id usuario gerente';


