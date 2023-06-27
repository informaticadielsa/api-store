
CREATE SEQUENCE seq_cmm_control_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.controles_maestros_multiples (
	cmm_control_id INTEGER NOT NULL DEFAULT nextval('seq_cmm_control_id'::regclass),
	cmm_nombre varchar(100) NOT NULL,
	cmm_valor varchar NOT NULL,
	cmm_sistema boolean NOT NULL,
	cmm_activo boolean NOT NULL,
	cmm_usu_usuario_creado_por_id int4 NOT NULL,
	"createdAt" timestamp NOT NULL DEFAULT LOCALTIMESTAMP,
	cmm_usu_usuario_modificado_por_id int4 NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT controles_maestros_pkey PRIMARY KEY (cmm_control_id),
	CONSTRAINT fk_controles_maestros_multiples_usu_usuario_creado_id FOREIGN KEY (cmm_usu_usuario_creado_por_id) REFERENCES usuarios(usu_usuario_id),
	CONSTRAINT fk_controles_maestros_multiples_usu_usuario_modificado_id FOREIGN KEY (cmm_usu_usuario_modificado_por_id) REFERENCES usuarios(usu_usuario_id)
);

ALTER TABLE public.controles_maestros_multiples OWNER TO postgres;
GRANT ALL ON TABLE public.controles_maestros_multiples TO postgres;



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
    1000000,
    'SYS_SCRIPT',
    '0',
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
    1000001,
    'ESTATUS_USUARIO',
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
    1000002,
    'ESTATUS_USUARIO',
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
    1000003,
    'ESTATUS_USUARIO',
    'ELIMINADO',
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
    1000004,
    'ESTATUS_MENU',
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
    1000005,
    'ESTATUS_MENU',
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
    1000006,
    'ESTATUS_MENU',
    'ELIMINADO',
    TRUE,
    TRUE,
    1,
    current_date
);


ALTER TABLE usuarios
	ADD CONSTRAINT fk_usuario_controles_maestros_mutiples_estatus FOREIGN KEY (usu_cmm_estatus_id) REFERENCES controles_maestros_multiples(cmm_control_id);

