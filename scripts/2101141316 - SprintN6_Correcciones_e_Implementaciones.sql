-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/01/14 
-- Description:	 SprintN6_Correcciones_e_Implementaciones 
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
--Eliminamos el precio como obligatorio
ALTER TABLE public.productos
    ALTER COLUMN prod_precio DROP NOT NULL;


--Eliminamos los productos de la tabla pivote
ALTER TABLE public.elementos_promocion 
    DROP COLUMN ep_prod_producto_id;


--Tabla de los productos  en promociones
CREATE SEQUENCE seq_prodprom_producto_promocion_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_promociones
(
    prodprom_producto_promocion_id integer NOT NULL DEFAULT nextval('seq_prodprom_producto_promocion_id'::regclass),
    prodprom_promdes_promocion_descuento_id integer NOT NULL,
    prodprom_prod_producto_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (prodprom_producto_promocion_id),
    CONSTRAINT unico_registro UNIQUE (prodprom_promdes_promocion_descuento_id, prodprom_prod_producto_id),
    CONSTRAINT promocion_id FOREIGN KEY (prodprom_promdes_promocion_descuento_id)
        REFERENCES public.promociones_descuentos (promdes_promocion_descuento_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT producto_id FOREIGN KEY (prodprom_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.productos_promociones
    OWNER to postgres;


ALTER TABLE public.productos
    ADD COLUMN prod_descripcion_corta character varying(200);


--Corregimos los roles, para Gerentes y vendedores
update roles
set 
rol_nombre = 'Gerente',
rol_tipo_rol_id = 1000056
where rol_rol_id  = (select rol_rol_id from  roles where rol_nombre = 'Vendedor Admin');

update roles
set 
rol_nombre = 'Vendedor',
rol_tipo_rol_id = 1000056
where rol_rol_id  = (select rol_rol_id from  roles where rol_nombre = 'Vendedor');

--Relaciones socios de negocios usuarios
CREATE SEQUENCE seq_usn_usuario_socio_de_negocio_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.usuarios_socios_de_negocio
(
    usn_usuario_socio_de_negocio_id integer NOT NULL DEFAULT nextval('seq_usn_usuario_socio_de_negocio_id'::regclass),
    usn_usu_usuario_id integer NOT NULL,
    usn_sn_socio_de_negocio_id integer NOT NULL,
    usn_usu_usuario_asignado_por_id integer not null,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    PRIMARY KEY (usn_usuario_socio_de_negocio_id),
    UNIQUE(usn_usu_usuario_id, usn_sn_socio_de_negocio_id),
    CONSTRAINT usuario_vendedor_id FOREIGN KEY (usn_usu_usuario_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT socio_de_negocio_id FOREIGN KEY (usn_sn_socio_de_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT fk_asignado_por_id FOREIGN KEY (usn_usu_usuario_asignado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

ALTER TABLE public.usuarios_socios_de_negocio
    OWNER to postgres;

ALTER TABLE public.usuarios_socios_de_negocio
    ADD CONSTRAINT socio_negocio_unico UNIQUE (usn_sn_socio_de_negocio_id);



------------ Primera parte de sprint


insert into controles_maestros_multiples (
    cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
    4,
	'TIPO_COMPRA',
	'Crédito',
	false,
	true,
	1,
	current_date
);
insert into controles_maestros_multiples (
    cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
    5,
	'TIPO_COMPRA',
	'Contado',
	false,
	true,
	1,
	current_date
);

insert into controles_maestros_multiples (
    cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
    16,
	'TIPO_ENVIO',
	'Envío domicilio',
	false,
	true,
	1,
	current_date
);

insert into controles_maestros_multiples (
    cmm_control_id,
	cmm_nombre,
	cmm_valor,
	cmm_sistema,
	cmm_activo,
	cmm_usu_usuario_creado_por_id,
	"createdAt"
) values (
    17,
	'TIPO_ENVIO',
	'Recolección',
	false,
	true,
	1,
	current_date
);



CREATE SEQUENCE seq_cf_compra_finalizada_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.compras_finalizadas
(
    cf_compra_finalizada_id integer NOT NULL DEFAULT nextval('seq_cf_compra_finalizada_id'::regclass),
    cf_compra_numero_orden character varying(100) NOT NULL,
    cf_compra_fecha date NOT NULL,
    cf_vendido_por_usu_usuario_id integer NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp,
    cf_cmm_tipo_compra_id integer NOT NULL,
    cf_vendido_a_socio_negocio_id integer NOT NULL,
    cf_cmm_tipo_envio_id integer not null,
    cf_direccion_envio_id integer not null,
    PRIMARY KEY (cf_compra_finalizada_id),
    CONSTRAINT vendedor_id FOREIGN KEY (cf_vendido_por_usu_usuario_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT socio_negocio_id FOREIGN KEY (cf_vendido_a_socio_negocio_id)
        REFERENCES public.socios_negocio (sn_socios_negocio_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT tipo_compra_id FOREIGN KEY (cf_cmm_tipo_compra_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT tipo_envio_id FOREIGN KEY (cf_cmm_tipo_envio_id)
        REFERENCES public.controles_maestros_multiples (cmm_control_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT direccion_envio FOREIGN KEY (cf_direccion_envio_id)
        REFERENCES public.socios_negocio_direcciones (snd_direcciones_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.compras_finalizadas
    OWNER to postgres;
ALTER TABLE public.compras_finalizadas
    ADD CONSTRAINT orden_compra_unica UNIQUE (cf_compra_numero_orden);

CREATE SEQUENCE seq_pcf_producto_compra_finalizada_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.productos_de_compra_finalizada
(
    pcf_producto_compra_finalizada_id integer NOT NULL DEFAULT nextval('seq_pcf_producto_compra_finalizada_id'::regclass),
    pcf_cf_compra_finalizada_id integer NOT NULL,
    pcf_prod_producto_id integer NOT NULL,
    pcf_cantidad_producto integer NOT NULL,
    pcf_precio_unitario double precision NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone,
    pcf_usu_usuario_agregado_por_id integer NOT NULL,
    PRIMARY KEY (pcf_producto_compra_finalizada_id),
    CONSTRAINT producto_id FOREIGN KEY (pcf_prod_producto_id)
        REFERENCES public.productos (prod_producto_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT agregado_por_id FOREIGN KEY (pcf_usu_usuario_agregado_por_id)
        REFERENCES public.usuarios (usu_usuario_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT compra_no FOREIGN KEY (pcf_cf_compra_finalizada_id)
        REFERENCES public.compras_finalizadas
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);
ALTER TABLE public.productos_de_compra_finalizada
    OWNER to postgres;
