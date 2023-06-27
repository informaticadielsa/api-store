-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/05/05 
-- Description:	 Mario Paginas institucionales 
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

CREATE SEQUENCE seq_pi_pagina_institucional_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.paginas_institucionales
(
    pi_pagina_institucional_id integer NOT NULL DEFAULT nextval('seq_pi_pagina_institucional_id'::regclass),
    pi_nombre_seccion character varying(200) NOT NULL,
    pi_contenido_html text NOT NULL,
    pi_usu_usuario_creador_id integer NOT NULL,
    pi_usu_usuario_modificador_id integer,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone,
    pi_cmm_status_id integer NOT NULL,
    PRIMARY KEY (pi_pagina_institucional_id),
    CONSTRAINT usuario_creador_id FOREIGN KEY (pi_usu_usuario_creador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT usuario_modificador_id FOREIGN KEY (pi_usu_usuario_modificador_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT estatus_pagina_institucional_id FOREIGN KEY (pi_cmm_status_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.paginas_institucionales
    OWNER to postgres;

    
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
    1000151,
    'STATUS_PAGINA_INSTITUCIONAL',
    'ACTIVA',
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
    1000152,
    'STATUS_PAGINA_INSTITUCIONAL',
    'INACTIVA',
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
    1000153,
    'STATUS_PAGINA_INSTITUCIONAL',
    'ELIMINADA',
    TRUE,
    TRUE,
    1,
    current_date
);