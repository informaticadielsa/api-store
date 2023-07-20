import { gql } from "apollo-server-express";
import models from "../models";

export const typeDefs = gql`
  type Query {
    getListUsers: [Usuario]
  }

  type Usuario {
    usu_usuario_id: Int
    usu_nombre: String
    usu_primer_apellido: String
    usu_segundo_apellido: String
    usu_correo_electronico: String
    usu_contrasenia: String
    usu_imagen_perfil_id: String
    usu_rol_rol_id: Int
    usu_cmm_estatus_id: Int
    usu_usuario_creado_por_id: String
    createdAt: DateTime
    usu_usuario_modificado_por_id: Int
    usu_codigo_vendedor: String
    usu_usuario_telefono: String
    usu_usuario_mobil: String
    updatedAt: DateTime
    usu_vendedor_gerente: Int
  }
`;

export const resolver = {
  Query: {
    getListUsers: async _ => {
      try {
        return await models.Usuario.findAll({
          where: {
            usu_cmm_estatus_id: 1000001
          }
        });
      } catch (error) {
        console.log(error);
        return error;
      }
    }
  }
};
