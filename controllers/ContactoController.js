const {contacto_us} = require('../services/ContactoUsEmail');
import models from '../models';
export default{
    contactoSendEmail: async(req, res, next) =>{
        try{
            console.log(req.body)
            await models.Contacto.create(req.body);
            await contacto_us(req.body);
            res.status(200).send({
                message: 'Mensaje enviado con exito'
            });
        }catch(e){
            res.status(500).send({
                message: 'Error al enviar mensaje',
                e
            });
            next(e);
        }
    }
}