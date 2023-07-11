import jwt from 'jsonwebtoken';
import env from 'dotenv';
env.config();
export default {
    encode: async (dataAllUser) => {
        const token = jwt.sign({ dataAllUser }, process.env.SECURITY_KEY, { expiresIn: 60*60*24*60 });
        return token;
    },
    recovery: async (dataAllUser) => {
        const token = jwt.sign({ dataAllUser }, process.env.SECURITY_KEY, { expiresIn: 60*60*12 });
        return token;
    },
    decodeToken: async(token) =>{
        const decodificado = jwt.decode(token);
        return decodificado;
    }
} 