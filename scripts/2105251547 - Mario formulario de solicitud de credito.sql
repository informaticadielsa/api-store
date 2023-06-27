-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/05/25 
-- Description:	 Mario formulario de solicitud de credito 
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

CREATE SEQUENCE seq_sdc_solicitud_de_credito_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.solicitudes_de_credito
(
    sdc_solicitud_de_credito_id integer NOT NULL DEFAULT nextval('seq_sdc_solicitud_de_credito_id'::regclass),
    sdc_nombre_razon_social character varying,
    sdc_rfc character varying,
    sdc_sito_web character varying,
    sdc_giro_empresa character varying,
    sdc_tipo_informa character varying,
    sdc_quien_informa character varying,
    sdc_antiguedad_puesto character varying,
    sdc_codigo_postal character varying,
    sdc_calle character varying,
    sdc_numero character varying,
    sdc_colonia character varying,
    sdc_municipio_delegacion character varying,
    sdc_pais integer,
    sdc_estado integer,
    sdc_pagos_telefono character varying,
    sdc_pagos_contacto character varying,
    sdc_pagos_correo_electronico character varying,
    sdc_contabilidad_telefono character varying,
    sdc_contabilidad_contacto character varying,
    sdc_contabilidad_correo_electronico character varying,
    sdc_direccion_general_telefono character varying,
    sdc_direccion_general_contacto character varying,
    sdc_direccion_general_correo_electronico character varying,
    sdc_facturacion_telefono character varying,
    sdc_facturacion_contacto character varying,
    sdc_facturacion_correo_electronico character varying,
    sdc_tipo_empresa character varying,
    sdc_tiene_sucursales boolean,
    sdc_pertenece_grupo boolean,
    sdc_grupo_pertenece character varying,
    sdc_antiguedad_empresa character varying,
    sdc_fecha_inicio_operacion date,
    sdc_capital_fijo character varying,
    sdc_capital_variable character varying,
    sdc_dimension_frente character varying,
    sdc_dimension_fondo character varying,
    sdc_dimension_superficie character varying,
    sdc_apoderado_legal_codigo_postal character varying,
    sdc_apoderado_legal_calle character varying,
    sdc_apoderado_legal_numero character varying,
    sdc_apoderado_legal_colonia character varying,
    sdc_apoderado_legal_municipio character varying,
    sdc_apoderado_legal_estado character varying,
    sdc_apoderado_legal_telefono character varying,
    sdc_apoderado_legal_correo_electronico character varying,
    sdc_apoderado_legal_tipo_domicilio character varying,
    sdc_apoderado_legal_renta character varying,
    sdc_rama_empresa_tipo character varying,
    sdc_rama_empresa_especifica character varying,
    sdc_rama_empresa_territorio_influencia character varying,
    sdc_rama_empresa_volumen_compra character varying,
    sdc_rama_empresa_promedio_ventas_mensuales character varying,
    sdc_rama_empresa_promedio_ventas_anuales character varying,
    sdc_rama_empresa_utilidades_anio_previo character varying,
    sdc_rama_empresa_utilidades_anio_presente character varying,
    sdc_rama_empresa_tipo_moneda character varying,
    sdc_rama_empresa_moneda_facturar character varying,
    sdc_rama_empresa_empleados_laborando character varying,
    sdc_rama_empresa_pagos_fijos_mensuales character varying,
    sdc_rama_empresa_tipo_local character varying,
    sdc_rama_empresa_monto_renta_local_mensual character varying,
    sdc_rama_empresa_limite_de_credito_deseado character varying,
    sdc_rama_empresa_plazo_credito character varying,
    sdc_referencia_comercial_uno_nombre character varying,
    sdc_referencia_comercial_uno_monto character varying,
    sdc_referencia_comercial_uno_antiguedad character varying,
    sdc_referencia_comercial_uno_plazo character varying,
    sdc_referencia_comercial_uno_telefonos character varying,
    sdc_referencia_comercial_dos_nombre character varying,
    sdc_referencia_comercial_dos_monto character varying,
    sdc_referencia_comercial_dos_antiguedad character varying,
    sdc_referencia_comercial_dos_plazo character varying,
    sdc_referencia_comercial_dos_telefonos character varying,
    sdc_referencia_comercial_tres_nombre character varying,
    sdc_referencia_comercial_tres_monto character varying,
    sdc_referencia_comercial_tres_antiguedad character varying,
    sdc_referencia_comercial_tres_plazo character varying,
    sdc_referencia_comercial_tres_telefonos character varying,
    sdc_referencia_bancaria_uno_banco character varying,
    sdc_referencia_bancaria_uno_no_cuenta character varying,
    sdc_referencia_bancaria_uno_sucursal character varying,
    sdc_referencia_bancaria_uno_ejecutivo_cuenta character varying,
    sdc_referencia_bancaria_uno_telefonos character varying,
    sdc_referencia_bancaria_dos_banco character varying,
    sdc_referencia_bancaria_dos_no_cuenta character varying,
    sdc_referencia_bancaria_dos_sucursal character varying,
    sdc_referencia_bancaria_dos_ejecutivo_cuenta character varying,
    sdc_referencia_bancaria_dos_telefonos character varying,
    sdc_recoleccion_de_mercancia_uno character varying,
    sdc_recoleccion_de_mercancia_dos character varying,
    sdc_recoleccion_de_mercancia_tres character varying,
    sdc_vehiculos boolean,
    sdc_status_cmm_control_id integer NOT NULL,
    sdc_sn_socio_de_negocio_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (sdc_solicitud_de_credito_id),
    CONSTRAINT socio_negocio_id FOREIGN KEY (sdc_sn_socio_de_negocio_id)
        REFERENCES public.socios_negocio(sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_status_solicitud FOREIGN KEY (sdc_status_cmm_control_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.solicitudes_de_credito
    OWNER to postgres;


CREATE SEQUENCE seq_ssdc_sucursal_solicitud_de_credito_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.sucursales_solicitud_de_credito
(
    ssdc_sucursal_solicitud_de_credito_id integer NOT NULL DEFAULT nextval('seq_ssdc_sucursal_solicitud_de_credito_id'::regclass),
    ssdc_codigo_postal character varying,
    ssdc_calle character varying,
    ssdc_numero character varying,
    ssdc_colonia character varying,
    ssdc_municipio character varying,
    ssdc_estado character varying,
    ssdc_telefono character varying,
    ssdc_correo_electronico character varying,
    ssdc_solicitud_de_credito_id integer not null,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (ssdc_sucursal_solicitud_de_credito_id),
    CONSTRAINT solicitud_de_credito_id FOREIGN KEY (ssdc_solicitud_de_credito_id)
        REFERENCES public.solicitudes_de_credito(sdc_solicitud_de_credito_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.sucursales_solicitud_de_credito
    OWNER to postgres;


CREATE SEQUENCE seq_vsdc_vehiculo_solicitud_de_credito_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.vehiculos_solicitud_de_credito
(
    vsdc_vehiculo_solicitud_de_credito_id integer NOT NULL DEFAULT nextval('seq_vsdc_vehiculo_solicitud_de_credito_id'::regclass),
    vsdc_marca character varying,
    vsdc_tipo character varying,
    vsdc_model character varying,
    vsdc_sdc_solicitud_de_credito_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (vsdc_vehiculo_solicitud_de_credito_id),
    CONSTRAINT solicitud_de_credito_id FOREIGN KEY (vsdc_sdc_solicitud_de_credito_id)
        REFERENCES public.solicitudes_de_credito(sdc_solicitud_de_credito_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.vehiculos_solicitud_de_credito
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
    1000158,
    'STATUS_SOLICITUD_CREDITO',
    'APROBADA',
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
    1000159,
    'STATUS_SOLICITUD_CREDITO',
    'PENDIENTE',
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
    1000160,
    'STATUS_SOLICITUD_CREDITO',
    'INCOMPLETA',
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
    1000164,
    'TIPO_ARCHIVO',
    'SOLICITUD_DE_CREDITO',
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
    1000165,
    'ESTATUS_ARCHIVOS',
    'ACTIVO',
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
    1000166,
    'ESTATUS_ARCHIVOS',
    'INACTIVO',
    TRUE,
    TRUE,
    1,
    current_date
);


ALTER TABLE public.archivos_de_inicio
    ALTER COLUMN adi_usu_usuario_creador_id DROP NOT NULL;

ALTER TABLE public.archivos_de_inicio
    ADD COLUMN adi_sn_socio_de_negocio_id integer;
ALTER TABLE public.archivos_de_inicio
    ADD CONSTRAINT socio_negocio_id FOREIGN KEY (adi_sn_socio_de_negocio_id)
    REFERENCES public.socios_negocio (sn_socios_negocio_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE public.archivos_de_inicio
    ADD CONSTRAINT unique_socio_negocio UNIQUE (adi_sn_socio_de_negocio_id);

ALTER TABLE public.archivos_de_inicio
    ADD COLUMN adi_sdc_solicitud_de_credito_id integer;
ALTER TABLE public.archivos_de_inicio
    ADD CONSTRAINT solicitud_de_credito FOREIGN KEY (adi_sdc_solicitud_de_credito_id)
    REFERENCES public.solicitudes_de_credito (sdc_solicitud_de_credito_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;



-------------------------------- CONTACT US ---------------
CREATE SEQUENCE seq_c_contacto_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.contactos
(
    c_contacto_id integer NOT NULL DEFAULT nextval('seq_c_contacto_id'::regclass),
    c_nombre character varying(300) NOT NULL,
    c_correo_electronico character varying(500) NOT NULL,
    c_empresa character varying(500),
    c_mensaje text NOT NULL,
    c_telefono character varying(20),
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (c_contacto_id)
);

ALTER TABLE public.contactos
    OWNER to postgres;


ALTER TABLE public.solicitudes_de_credito
    ADD COLUMN sdc_nombre_quien_informa character varying;

ALTER TABLE public.solicitudes_de_credito
    ADD COLUMN sdc_cantidad_vehiuculo character varying;