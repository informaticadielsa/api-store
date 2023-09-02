
import models from '../models';
import statusControles from '../mapeos/mapeoControlesMaestrosMultiples';
import {  Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);
const { Op } = require("sequelize");

const listToTree = function(list){
  // Diccionario de referencias, para no tener que estar dando varias pasadas,
  // ya que no hay garantia de que los padres elementos estén ordenados por id 
  // o que los padres tengan IDs de valor menor a sus hijos.
  var dictionary = {};
  var tree = [];
  for(var i = 0;i < list.length; i++){
    var element = {};
    for(var x in list[i]){
      // Clon
      element[x] = list[i][x];
    }
    // Si existe un padre temporal, recuperamos la lista de hijos.
    element.hijos = dictionary[element.cat_categoria_id] ? dictionary[element.cat_categoria_id].hijos: []; 
    dictionary[element.cat_categoria_id] = element;
    if(element.cat_cat_categoria_padre_id){
      // Si no existe el padre en el diccionario, creamos un padre temporal
      // Esto es parte de la estrategia para no tener que iterar varias veces
      if(!dictionary[element.cat_cat_categoria_padre_id]){
        dictionary[element.cat_cat_categoria_padre_id] = { id:element.cat_cat_categoria_padre_id, hijos: [] }; 
      }
        dictionary[element.cat_cat_categoria_padre_id].hijos.push(element);
      }
    else{
      // Es un padre y se agrega a la raiz del arbol. Se asume que pueden existir multiples padres.
      tree.push(element);
    }
  }
  return tree.length === 1 ? tree[0] : tree ;//Si solo hay un padre, se envía solo ese objeto en lugar del arreglo completo.
}
  
export default{
    getCategorias: async(req, res, next) =>{
        try{
            const categorias = await models.Categoria.findAll({
                attributes: {exclude: ['cat_usu_usuario_creador_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt']},
                order: [
                    ['cat_categoria_id', 'ASC']
                ],
                // include: [{
                //   model: models.Atributo,
                //   attributes: { exclude: ['at_usu_usuario_creador_id', 'createdAt', 'at_usu_usuario_modificador_id','updatedAt'] },
                //   where: { 
                //     at_cmm_estatus_id: { [Op.ne]: statusControles.ESTATUS_ATRIBUTO.ELIMINADO }
                //   },
                //   required: false
                // }],
                where: {
                  cat_cmm_estatus_id : { [Op.ne] : statusControles.ESTATUS_CATEGORIA.ELIMINADO }
                }
            })

            const arrayParaFuncion = [];
            categorias.forEach(function(categoria){
                    arrayParaFuncion.push(categoria.dataValues)
            });
            // const tree =  listToTree(arrayParaFuncion);
            res.status(200).send({
                message: "Categorias",
                categorias
            })
        }catch(e){
            res.status(500).send({
                message: 'Error',
                e
            });
            next(e);
        }
    },
    getCategoriasPublic: async(req, res, next) =>{
        try{ 
            const categorias = await models.Categoria.findAll({
                attributes: {exclude: ['cat_usu_usuario_creador_id', 'createdAt', 'cat_usu_usuario_modificador_id', 'updatedAt']},
                order: [
                    ['cat_categoria_id', 'ASC']
                ],
                where: {
                  cat_cmm_estatus_id : { [Op.ne] : statusControles.ESTATUS_CATEGORIA.ELIMINADO }
                }
            })

            const arrayParaFuncion = [];
            categorias.forEach(function(categoria){
                    arrayParaFuncion.push(categoria.dataValues)
            });
            const tree =  await listToTree(arrayParaFuncion);
            res.status(200).send({
                message: "Categorias",
                tree
            })
        }catch(e){
            res.status(500).send({
                message: 'Error',
                e
            });
            next(e);
        }
    },
    getCategoriasFather: async(req, res, next) =>{
      try{
        const categoriasFather = await models.Categoria.findAll({ where : { cat_cat_categoria_padre_id : null }});
        res.status(200).send({
          message: 'Categorias padres',
          categoriasFather
        });
      }catch(e){
        res.status(500).send({
          message: 'Error al traer padres',
          e
        })
      }
    },
    createCategoria: async(req, res, next) =>{
      try{
        req.body.createdAt = Date()
        console.log('Categoria', req.body)
        await models.Categoria.create(req.body)
        res.status(200).send({
          message: 'Categoría creada exitosamente'
        })
      }catch(e){
        res.status(500).send({
          message: 'Error al crear categoría',
          e
        });
        next(e);
      }
    },
    updateCategoria: async (req, res, next) =>{
      try{
        console.log(req.body, req.body.childs_to_update_status);
        
        const categoriaUpdate = await models.Categoria.findOne({ where: 
          {cat_categoria_id : req.body.cat_categoria_id} 
        });
        await categoriaUpdate.update({
          cat_nombre: !!req.body.cat_nombre ? req.body.cat_nombre : categoriaUpdate.dataValues.cat_nombre,
          cat_descripcion: !!req.body.cat_descripcion ? req.body.cat_descripcion : categoriaUpdate.dataValues.cat_descripcion,
          cat_meta_titulo: !!req.body.cat_meta_titulo ? req.body.cat_meta_titulo : categoriaUpdate.dataValues.cat_meta_titulo,
          cat_meta_descripcion: !!req.body.cat_meta_descripcion ? req.body.cat_meta_descripcion : categoriaUpdate.dataValues.cat_meta_descripcion,
          cat_cmm_estatus_id: !!req.body.cat_cmm_estatus_id ? req.body.cat_cmm_estatus_id : categoriaUpdate.dataValues.cat_cmm_estatus_id,
          updateAt: Date(),
          cat_usu_usuario_modificador_id: req.body.cat_usu_usuario_modificador_id,
          cat_nombre_tienda: !!req.body.cat_nombre_tienda ? req.body.cat_nombre_tienda : categoriaUpdate.dataValues.cat_nombre_tienda,
          cat_categoria_link: !!req.body.cat_categoria_link ? req.body.cat_categoria_link : categoriaUpdate.dataValues.cat_categoria_link,
        });
        //Si se manda arreglo de hijos cambiamos los estados acorede al padre.
        if(!!req.body.childs_to_update_status && !!req.body.cat_cmm_estatus_id){
          let arrayAtributos = req.body.childs_to_update_status.concat(categoriaUpdate.dataValues.cat_categoria_id);

          // await models.Atributo.update({
          //   at_cmm_estatus_id: req.body.cat_cmm_estatus_id == statusControles.ESTATUS_CATEGORIA.ACTIVO ? statusControles.ESTATUS_ATRIBUTO.ACTIVO : req.body.cat_cmm_estatus_id == statusControles.ESTATUS_CATEGORIA.INACTIVO ? statusControles.ESTATUS_ATRIBUTO.INACTIVO : statusControles.ESTATUS_ATRIBUTO.ELIMINADO,
          //   at_usu_usuario_modificador_id: req.body.cat_usu_usuario_modificador_id,
          //   updateAt: Date()
          // },{
          //   where: {
          //     at_cat_categoria_id : arrayAtributos
          //   }
          // });

          await models.Categoria.update({
            cat_cmm_estatus_id:  !!req.body.cat_cmm_estatus_id ? req.body.cat_cmm_estatus_id : categoriaUpdate.dataValues.cat_cmm_estatus_id,
            cat_usu_usuario_modificador_id: req.body.cat_usu_usuario_modificador_id,
            updateAt: Date()
          },{
            where: {
              cat_categoria_id: req.body.childs_to_update_status
            }
          });
        };
        
        res.status(200).send({
          message: 'Actualización correcta'
        })
      }catch(e){
        res.status(500).send({
          message: 'Error al actualizar categoria',
          e
        });
        next(e);
      }
    },
    createAtributo: async(req, res, next)=>{
      try{
        await models.Atributo.create(req.body);
        res.status(200).send({
          message: 'Atributo resgistrado correctamente'
        });
      }catch(e){
        res.status(200).send({
          message: 'Error en la creación de atributo',
          e
        })
        next(e);
      }
    },
    updateAtribute: async(req, res, next) =>{
      try{
          const atributo = await models.Atributo.findOne({where: {
            at_atributo_id: req.body.at_atributo_id
          }})
          await atributo.update({
            at_nombre : req.body.at_nombre != 'undefined' ? req.body.at_nombre : atributo.at_nombre,
            at_descripcion : req.body.at_descripcion != 'undefined' ? req.body.at_descripcion : atributo.at_descripcion,
            at_cmm_estatus_id : req.body.at_cmm_estatus_id != 'undefined' ? req.body.at_cmm_estatus_id : atributo.at_cmm_estatus_id,
            at_usu_usuario_modificador_id : req.body.at_usu_usuario_modificador_id,
            updatedAt : Date()
          })
          res.status(200).send({
            message: 'Actualización exitosa'
          })
      }catch(e){
        res.status(500).send({
          message: 'Error al actualizar atributo',
          e
        });
        next(e);
      }
    },
    deleteAtribute: async(req, res, next) =>{
      try{
        console.log(req.body.at_atributo_id)
        const deleteAtribute = await models.Atributo.findOne({where: { at_atributo_id : req.body.at_atributo_id}});
        await deleteAtribute.update({
          at_cmm_estatus_id : statusControles.ESTATUS_ATRIBUTO.ELIMINADO,
          at_usu_usuario_modificador_id: req.body.at_usu_usuario_modificador_id,
          updatedAt: Date()
        })
        res.status(200).send({
          message: 'Eliminado correctamente'
        });
      }catch(e){
        res.status(500).send({
          message: 'Error al eliminar el atributo',
          e
        });
        next(e);
      }
    }
}
