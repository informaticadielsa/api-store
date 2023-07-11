
import express from "express";
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import jwt from 'jsonwebtoken';
import env from 'dotenv';
env.config();

import config from './config';
import morgan from "morgan";
import cors from "cors";
import path from "path";

// routes
import router from "./routes";

// Example import file graphql
const UsertypeDefs = `#graphql
  type Query {
    hello(nombreUsuario: String): String
  }

  type Mutation {
    newUser(name: String, lastName: String): mngUser
  }

  type mngUser {
    mng: String
    code: Int
  }
`;
const Userresolvers = {
  Query: {
    hello: (_, res) => {
      console.log(res);
      return `world ${res.nombreUsuario}`;
    },
  },
  Mutation: {
    newUser: (_, res) => {
      console.log('res ', res);
      return { mng: "Usuario guardado correctamente", code: 201 }
    }
  }
};

const Query = `
    scalar DateTime
`;

const schema = makeExecutableSchema({
  typeDefs: [
    Query,
    UsertypeDefs,
  ],
  resolvers: [
    Userresolvers,
  ]
});

// create your server here with express
const app = express();

async function startServer() {

  const apolloServer = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    context: ({ req }) => {
      const token = req.headers.authorization ? req.headers.authorization : null;
      if (!req.body.operationName.startsWith('IntrospectionQuery')) {
        // console.log(req.body.operationName);
        const querysIncluidas = !['LoginUsuario', 'NewUsuario'].includes(req.body.operationName);
        // console.log(querysIncluidas);
        if (querysIncluidas) {
          try {
            return jwt.verify(token.replace('Bearer ', ''), process.env.SECURITY_KEY);
          } catch (error) {
            throw new Error('Token invalido');
          }
        }
      }
    }
  });

  // "start()" inicializa las funciones de Apollo
  await apolloServer.start()

  app.use(morgan("dev"));
  app.use(cors());
  app.use(express.json({ limit: "50mb", extended: true }));
  app.use(express.urlencoded({ extended: true, limit: "100mb", extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.static(path.join(__dirname, "private")));

  app.use("/api", router);
  app.set("port", config.PORT, config.HOST);

  apolloServer.applyMiddleware({ app });

  app.listen(app.get('port'), () => {
    console.log(`🚀 Server running in port ${app.get('port')} /graphql`)
  });
}

startServer();