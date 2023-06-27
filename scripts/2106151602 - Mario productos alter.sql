-- ============================================= 
-- Author:		Hernán Gómez 
-- Create date: 2021/06/15 
-- Description:	 Mario productos alter 
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
---- ESTE NO SE EJECUTA AHORITA

--ALTER TABLE public.productos DROP CONSTRAINT ref_fk_prod_prod_producto_padre_sku;

--ALTER TABLE public.productos DROP CONSTRAINT productos_check;


--- TIPO COLECCION 
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
    1000154,
    'TIPO_COLECCION',
    'CARRUCEL',
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
    1000155,
    'TIPO_COLECCION',
    'DESTACADO',
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
    1000156,
    'TIPO_COLECCION',
    'RELACIONADO',
    TRUE,
    TRUE,
    1,
    current_date
);

ALTER TABLE public.colecciones
    ADD COLUMN col_tipo integer DEFAULT 1000154;
ALTER TABLE public.colecciones
    ADD CONSTRAINT tipo_coleccion FOREIGN KEY (col_tipo)
    REFERENCES public.controles_maestros_multiples (cmm_control_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


    


---------------------------------------- PROMOCIONES Y CARRITOS ------------------------------------------------------------------------INSERT INTO public.controles_maestros_multiples
insert into controles_maestros_multiples(
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
    1000157,
    'TIPO_PROMOCION',
    '3 X 2',
    TRUE,
    TRUE,
    1,
    current_date
);



update controles_maestros_multiples 
set 
cmm_valor = 'Monto fijo'
where cmm_control_id  = 1000062;

update controles_maestros_multiples 
set 
cmm_valor = 'Porcentaje'
where cmm_control_id  = 1000063;

update controles_maestros_multiples 
set 
cmm_valor = 'Regalo'
where cmm_control_id  = 1000064;

update controles_maestros_multiples 
set 
cmm_valor = 'Envío Gratis'
where cmm_control_id  = 1000065;

update controles_maestros_multiples 
set 
cmm_valor = '2 X 1'
where cmm_control_id  = 1000066;

ALTER TABLE public.promociones_descuentos
    ADD COLUMN promdes_sku_gift integer;
ALTER TABLE public.promociones_descuentos
    ADD CONSTRAINT sku_gif FOREIGN KEY (promdes_sku_gift)
    REFERENCES public.productos (prod_producto_id)
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;


    

insert into  menus (mn_nombre, mn_ruta, mn_cmm_estatus_id, mn_usu_usuario_creado_por_id, "createdAt", mn_tipo_menu_id)
values ('Proveedores', '/suppliers', 1000004, 1, current_date, 1000054);

----Mi Cuenta (my_profile)
----Mis direcciones (my_addresses)
----Lista de favoritos  (favorites_list)
----Mis pedidos (my_orders)
----Mis facturas (my_bills)
----Mis cotizaciones    (my_quotes)
----Mis proyectos   (my_projects)


insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Mi Cuenta',
	'/my_profile',
	1000004,
	1,
	current_date,
    1000055
);


insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Mis Direcciones',
	'/my_addresses',
	1000004,
	1,
	current_date,
    1000055
);

insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Lista de favoritos',
	'/favorites_list',
	1000004,
	1,
	current_date,
    1000055
);

insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Mis pedidos',
	'/my_orders',
	1000004,
	1,
	current_date,
    1000055
);


insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Mis facturas',
	'/my_bills',
	1000004,
	1,
	current_date,
    1000055
);


insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Mis cotizaciones',
	'/my_quotes',
	1000004,
	1,
	current_date,
    1000055
);


insert into menus (
	mn_nombre,
	mn_ruta,
	mn_cmm_estatus_id,
	mn_usu_usuario_creado_por_id,
	"createdAt",
    mn_tipo_menu_id
)
values 
(
	'Mis proyectos',
	'/my_projects',
	1000004,
	1,
	current_date,
    1000055
);

update roles_permisos set
rol_per_ver  = true,
rol_per_editar = true,
rol_per_crear  = true,
rol_per_eliminar  = true 
where rol_per_mu_menu_id  in(
	select 
		m.mn_menu_id
	from roles r
	left join menus m on m.mn_tipo_menu_id  = 1000055
	where rol_nombre  = 'Administrador' and rol_tipo_rol_id  = 1000055
)
and rol_per_rol_rol_id in (

	select 
		r.rol_rol_id 
	from roles r
	left join menus m on m.mn_tipo_menu_id  = 1000055
	where rol_nombre  = 'Administrador' and rol_tipo_rol_id  = 1000055
);

------------------- CARRITO DE COMPRAS 

-------------- producto de regalo
    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_precio double precision;

    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_prod_producto_id_regalo integer;

    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_cantidad_producto_regalo integer;
    ALTER TABLE public.productos_carrito_de_compra
        ADD CONSTRAINT producto_regalo_id FOREIGN KEY (pcdc_prod_producto_id_regalo)
        REFERENCES public.productos (prod_producto_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;
    -------------------------- Promoción por porcentaje y/o monto 
    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_descuento_promocion double precision;
------------ producto de regalo e promoción
    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_prod_producto_id_promocion integer;

    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_cantidad_producto_promocion integer;
    ALTER TABLE public.productos_carrito_de_compra
        ADD CONSTRAINT producto_promocion FOREIGN KEY (pcdc_prod_producto_id_promocion)
        REFERENCES public.productos (prod_producto_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;
------------------- Cupon aplicado, carrito y/o producto
    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_cupon_aplicado boolean DEFAULT false;


    ALTER TABLE public.promociones_descuentos DROP COLUMN promdes_descuento_total;

    ALTER TABLE public.productos_carrito_de_compra DROP COLUMN pcdc_mejor_descuento;

    ALTER TABLE public.productos_carrito_de_compra
        ADD COLUMN pcdc_mejor_descuento integer;
----------------------- Campo por porcentaje y/o montofijo
ALTER TABLE public.promociones_descuentos
    ADD COLUMN promdes_carrito_articulo boolean;

-------------- Proyectos_cotizaciones  precio de cotización en producto
ALTER TABLE public.productos_cotizaciones
    ADD COLUMN pc_precio double precision;


---------------------------------------------- FINALIZAR COMPRA
    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_precio double precision;

    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_prod_producto_id_regalo integer;

    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_cantidad_producto_regalo integer;
    ALTER TABLE public.productos_de_compra_finalizada
        ADD CONSTRAINT producto_regalo_id FOREIGN KEY (pcf_prod_producto_id_regalo)
        REFERENCES public.productos (prod_producto_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;
    -------------------------- Promoción por porcentaje y/o monto 
    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_descuento_promocion double precision;
------------ producto de regalo e promoción
    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_prod_producto_id_promocion integer;

    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_cantidad_producto_promocion integer;
    ALTER TABLE public.productos_de_compra_finalizada
        ADD CONSTRAINT producto_promocion FOREIGN KEY (pcf_prod_producto_id_promocion)
        REFERENCES public.productos (prod_producto_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID;
------------------- Cupon aplicado, carrito y/o producto
    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_cupon_aplicado boolean DEFAULT false;

    ALTER TABLE public.productos_de_compra_finalizada DROP COLUMN pcf_descuento_producto;

    ALTER TABLE public.productos_de_compra_finalizada
        ADD COLUMN pcf_descuento_producto integer;
