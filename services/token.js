import jwt from 'jsonwebtoken';
export default {
    encode: async (dataAllUser) => {
        const token = jwt.sign({ dataAllUser }, 'estoicoubermensch', { expiresIn: 60*60*24*60 });
        return token;
    },
    recovery: async (dataAllUser) => {
        const token = jwt.sign({ dataAllUser }, 'estoicoubermensch', { expiresIn: 60*60*12 });
        return token;
    },
    decodeToken: async(token) =>{
        const decodificado = jwt.decode(token);
        return decodificado;
    }
} 