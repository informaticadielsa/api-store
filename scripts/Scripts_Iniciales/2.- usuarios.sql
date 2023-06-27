CREATE SEQUENCE seq_usu_usuario_id START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE TABLE public.usuarios (
	usu_usuario_id INTEGER NOT NULL DEFAULT nextval('seq_usu_usuario_id'::regclass),
	usu_nombre varchar(50) NOT NULL,
	usu_primer_apellido varchar(50) NOT NULL,
	usu_segundo_apellido varchar(50) NULL,
	usu_correo_electronico varchar(100) NOT NULL,
	usu_contrasenia varchar(200) NOT NULL,
	usu_imagen_perfil_id uuid NULL,
	usu_rol_rol_id int4 NULL,
	usu_cmm_estatus_id int4 NULL,
	usu_usuario_creado_por_id int4 NULL,
	"createdAt" timestamp NOT NULL,
	usu_usuario_modificado_por_id int4 NULL,
	"updatedAt" timestamp NULL,
	CONSTRAINT unique_usu_correo_electronico UNIQUE (usu_correo_electronico),
	CONSTRAINT usuarios_pkey PRIMARY KEY (usu_usuario_id)
);
ALTER TABLE public.usuarios OWNER TO postgres;
GRANT ALL ON TABLE public.usuarios TO postgres;
ALTER TABLE usuarios
	ADD CONSTRAINT fk_usu_usuario_creado_por_id FOREIGN KEY (usu_usuario_creado_por_id) REFERENCES usuarios(usu_usuario_id),
	ADD CONSTRAINT fk_usu_usuario_modificado_por_id FOREIGN KEY (usu_usuario_modificado_por_id) REFERENCES usuarios(usu_usuario_id);


INSERT INTO public.usuarios 
(
    usu_nombre,
    usu_primer_apellido,
    usu_correo_electronico,
    usu_contrasenia,
    usu_rol_rol_id,
    usu_cmm_estatus_id,
    "createdAt"
)
VALUES
(
    'Mario',
    'Gómez',
    'admin@admin.com',
    '$2a$10$oME2DyHWV/C5JgqC03jKkehKE12EaNtBUw5SV6DVVcirqFolD5Q7a', --Contraseña = admin123
    1,
    1000001,
	current_date
);