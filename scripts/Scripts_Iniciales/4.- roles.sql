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
    1000007,
    'ESTATUS_ROL',
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
    1000008,
    'ESTATUS_ROL',
    'INACTIVO',
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
    1000009,
    'ESTATUS_ROL',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);


CREATE SEQUENCE seq_rol_rol_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.roles (
	rol_rol_id INTEGER NOT NULL DEFAULT nextval('seq_rol_rol_id'::regclass),
	rol_nombre varchar(100) NOT NULL,
	rol_descripcion varchar(500) NULL,
	rol_cmm_estatus INTEGER NOT NULL,
	rol_usu_usuario_creado_por_id int4 NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT LOCALTIMESTAMP,
	rol_usu_usuario_modificado_por_id int4 NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT roles_pkey PRIMARY KEY (rol_rol_id),
	CONSTRAINT fk_roles_usu_usuario_creado_por_id FOREIGN KEY (rol_usu_usuario_creado_por_id) REFERENCES usuarios(usu_usuario_id),
	CONSTRAINT fk_roles_usuarios_modificado_por FOREIGN KEY (rol_usu_usuario_modificado_por_id) REFERENCES usuarios(usu_usuario_id),
	CONSTRAINT fk_roles_controles_maestros_multiples FOREIGN KEY (rol_cmm_estatus) REFERENCES controles_maestros_multiples(cmm_control_id)
);

ALTER TABLE public.roles OWNER TO postgres;
GRANT ALL ON TABLE public.roles TO postgres;


INSERT INTO public.roles
(
    rol_nombre,
    rol_descripcion,
    rol_cmm_estatus,
    rol_usu_usuario_creado_por_id,
    "createdAt"
)
VALUES
(
    'Administrador',
    'Rol principal, todos los permisos para el usuario.',
	1000007,
	1,
    current_date
);


ALTER TABLE usuarios
	ADD CONSTRAINT fk_usuarios_roles_rol FOREIGN KEY (usu_rol_rol_id) REFERENCES roles(rol_rol_id);