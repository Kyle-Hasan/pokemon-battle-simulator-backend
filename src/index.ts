
import "reflect-metadata";
import express, { Application, json } from "express";
import http from "http";

import { buildSchema } from "type-graphql";


import cors from 'cors';

import { connectDB } from "./database";
import { PokemonSpeciesResolver } from "./graphql/resolver/PokemonSpeciesResolver";
import { ApolloServer, BaseContext } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import dotenv from 'dotenv';
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { addPokemon } from "./seed";
import { TeamResolver } from "./graphql/resolver/TeamResolver";
import { PokemonResolver } from "./graphql/resolver/PokemonResolver";




async function bootstrap() {
 
  console.log("logging from main " + process.env)


  
  connectDB()
  

  
  const app: Application = express();
  const httpServer = http.createServer(app);

  const schema = await buildSchema({
    resolvers: [PokemonSpeciesResolver,TeamResolver,PokemonResolver],
  });

 
  const server = new ApolloServer<BaseContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

 

await server.start();
// Use expressMiddleware to mount Apollo Server at the "/graphql" endpoint
app.use(
  '/graphql',
  json(),
  (expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  }) as unknown) as express.RequestHandler
);

 


 
  const PORT = 4000;
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );
  const printedSchema = printSchema(schema);

  writeFileSync("schema.graphql", printedSchema); // Save schema to a file
  console.log("✅ GraphQL schema saved to schema.graphql");
  console.log(`🚀 Server ready at http://localhost:${PORT}}`);
}

bootstrap();
