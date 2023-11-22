import models from '../models';
import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(process.env.POSTGRESQL);

module.exports = {
    insertLog: async function (seccion, descrip, sistema, usuario, tipoRegistro){
        try {

            const bodyCreate = {
            seccion:seccion,
            descripcion: descrip,
            sistema:sistema,
            usuario:usuario,
            tipoRegistro: tipoRegistro,
           
        };
          const so =await models.Registros.create(bodyCreate)

           // await models.Proyectos.create(bodyCreate)

        return ({status:(so!= null && (so.id) ?'success': 'fail'), message: (so!= null && (so.id) ?'Agregado corrrectamente': 'Hubo un error al agregar el log')})
        }
        catch(e){   
            return ({status:'fail',message:e})
        }
    }

};