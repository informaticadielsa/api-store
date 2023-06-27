import jwt from 'jsonwebtoken';
export default {
    //Se utiliza para el acceso de rutas.
    verifyToken(req, res, next){
        try{
            const token = req.headers['token']
            if(!token){
                return res.status(404).json({
                    message: "Error Token"
                })
            }
            jwt.verify(token, 'estoicoubermensch', (err, decoded)=>{
                const recuperacion = jwt.decode(token);
                if(recuperacion.dataAllUser.usu_recovery || recuperacion.dataAllUser.snu_socio){
                    return res.status(403).json({message:"Token no valido."})
                }
                else if(err){
                    return res.status(403).json({message:"error token"})
                }
                req.decoded = decoded
                next()
            })
        }catch(e){
            return {
                message:"Error token"    
            }
        }
    },
    verifyTokenSocioNegocio(req, res, next){
        try{
            const token = req.headers['token']
            if(!token){
                return res.status(404).json({
                    message: "Error Token"
                })
            }
            jwt.verify(token, 'estoicoubermensch', (err, decoded)=>{
                const recuperacion = jwt.decode(token);
                if(recuperacion.dataAllUser.usu_recovery || !recuperacion.dataAllUser.snu_socio){
                    return res.status(403).json({message:"Token no valido."})
                }
                else if(err){
                    return res.status(403).json({message:"error token"})
                }
                    req.decoded = decoded
                    next();
            })
        }catch(e){
            return {
                message:"Error token"    
            }
        }
    },
    //Solo se usa, para recuperación de contraseña.
    verifyTokenRecovery(req, res, next){
        try{
            const token = req.headers['token']
            if(!token){
                return res.status(404).json({
                    message: "Error Token"
                })
            }
            jwt.verify(token, 'estoicoubermensch', (err, decoded)=>{
                const recuperacion = jwt.decode(token);
                if(recuperacion.dataAllUser.usu_recovery){
                    req.decoded = decoded
                    next()
                }else if(err){
                    return res.status(403).json({message:"Error token"})
                }
            })
        }catch(e){
            return {
                message:"Error token"    
            }
            next();
        }
    },
}