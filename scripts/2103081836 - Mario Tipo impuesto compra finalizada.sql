-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/03/08 
-- Description:	 Mario Tipo impuesto compra finalizada 
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

insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Pedidos',
	'/order_history',
	1000004,
	1,
	current_date,
    1000054
);

insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Facturas',
	'/facturas',
	1000004,
	1,
	current_date,
    1000054
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Facturas',
	'/facturas',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Pedidos',
	'/order_history',
	1000004,
	1,
	current_date,
    1000056
);

insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Pedidos',
	'/order_history',
	1000004,
	1,
	current_date,
    1000056
);





insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Compra rapida',
	'/quotes',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Cotizaciones y proyectos',
	'/quotelist',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Socios de negocio',
	'/socios_de_negocio',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Promociones',
	'/promotions',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Usuarios',
	'/users',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Roles',
	'/roles',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Equipos de trabajos',
	'/equipos_trabajo',
	1000004,
	1,
	current_date,
    1000056
);


insert into menus 
(
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values
(
	'Asignación de socios de negocio',
	'/sellers',
	1000004,
	1,
	current_date,
    1000056
);



ALTER TABLE public.compras_finalizadas
    ADD COLUMN cf_cmm_tipo_impuesto integer;
ALTER TABLE public.compras_finalizadas
	ALTER COLUMN cf_cmm_tipo_impuesto set default 1000085;
    
ALTER TABLE compras_finalizadas ADD CONSTRAINT tipo_impuesto
FOREIGN KEY (cf_cmm_tipo_impuesto) REFERENCES controles_maestros_multiples(cmm_control_id);

ALTER TABLE public.compras_finalizadas
    ALTER COLUMN cf_direccion_envio_id DROP NOT NULL;

ALTER TABLE public.compras_finalizadas
    ALTER COLUMN cf_direccion_envio_id DROP NOT NULL;

ALTER TABLE public.compras_finalizadas
    ADD COLUMN cf_alm_almacen_recoleccion integer;

    
ALTER TABLE compras_finalizadas ADD CONSTRAINT almacen_recoleccion
FOREIGN KEY (cf_alm_almacen_recoleccion) REFERENCES almacenes(alm_almacen_id);

ALTER TABLE public.promociones_descuentos
    ADD COLUMN promdes_cupon_descuento character varying;


ALTER TABLE public.productos
    ADD COLUMN prod_lista_precio integer;
    
ALTER TABLE public.productos ADD CONSTRAINT lista_de_precios
FOREIGN KEY (prod_lista_precio) REFERENCES listas_de_precios(listp_lista_de_precio_id);

ALTER TABLE public.listas_de_precios
    ADD COLUMN listp_descuento integer;

ALTER TABLE public.promociones_descuentos
    ADD COLUMN promdes_descuento_total integer;

ALTER TABLE public.carrito_de_compras
    ADD COLUMN carcop_descuento_producto jsonb;

ALTER TABLE public.productos_de_compra_finalizada
    ADD COLUMN pcf_descuento_producto jsonb;

ALTER TABLE public.compras_finalizadas
    ADD COLUMN cf_total_compra double precision;

ALTER TABLE public.cotizaciones_proyectos
    ADD COLUMN cot_total_cotizacion double precision;

ALTER TABLE public.productos_cotizaciones
    ADD COLUMN pc_descuento_producto jsonb;