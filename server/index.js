const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Attack {
    name: String
    type: String
    damage:Int
  }
  type AttackWrap {
    fast:[Attack]
    special:[Attack]
  }
  type Sizes {
    minimum:String
    maximum:String
  }
  type SimplePoke {
    id: Int
    name: String
  }
  type EvolutionReq{
    amount:Int
    name:String
  }
  type Pokemon {
    id: String
    name: String!
    classification: String
    types:[String]
    resistant:[String]
    weaknesses:[String]
    weight: Sizes
    height: Sizes
    fleeRate:Float
    evolutionRequirements: EvolutionReq
    evolutions:[SimplePoke]
    maxCP:Int
    maxHP:Int
    attacks: AttackWrap
  }
  


  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String!): Pokemon
    PokemonWithAttackName(name: String!): [Pokemon]
    Types: [String]
    Type(name: String!) : [Pokemon]
    Attacks: AttackWrap
    AttacksWithType(type:String!): [Attack]
    
  }

  input SizesInput {
    minimum:String
    maximum:String
  }
  input AttackInput {
    name: String
    type: String
    damage:Int
  }
  input PokemonInput {
    id: String
    name: String!
    classification: String
    types:[String]
    resistant:[String]
    weaknesses:[String]
    weight: SizesInput
    height: SizesInput
    fleeRate:Float
  }

  type Mutation {
    DeleteAttack(name:String!): [Attack]
    AddType(newType: String!): [String]
    ModifyType(old:String!,new:String!): [String]
    DeleteType(old:String!): String
    AddAttack(type: String!, input: AttackInput): [Attack]
    ModifyAttack(name: String!, input: AttackInput): Attack
    AddPokemon(input: PokemonInput): [Pokemon]
    ModifyPokemon(id: String, input: PokemonInput): Pokemon
    DeletePokemon(id:String):[Pokemon]
  }
`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    return data.pokemon.find((pokemon) => pokemon.name === request.name);
  },
  PokemonWithAttackName: (request) => {
    return data.pokemon.filter((pokemon) => {
      return (
        pokemon.attacks.fast
          .map((attack) => {
            return attack.name;
          })
          .includes(request.name) ||
        pokemon.attacks.special
          .map((attack) => {
            return attack.name;
          })
          .includes(request.name)
      );
    });
  },
  Types: () => {
    return data.types;
  },
  Type: (request) => {
    console.log(data.pokemon);
    return data.pokemon.filter((pokemon) => {
      return pokemon.types.includes(request.name);
    });
  },
  Attacks: () => {
    return data.attacks;
  },
  AttacksWithType: (request) => {
    return data.attacks[request.type];
  },
  AddType: (request) => {
    data.types.push(request.newType);
    return data.types;
  },
  ModifyType: (request) => {
    if (data.types.includes(request.old)) {
      data.types[data.types.indexOf(request.old)] = request.new;
      return data.types;
    }
    return ["error"];
  },
  DeleteType: (request) => {
    if (data.types.includes(request.old)) {
      return data.types.splice(data.types.indexOf(request.old), 1)[0];
    }
    return `you dont have ${request.old}.`;
  },
  AddAttack: (request) => {
    const { type, input } = request;
    data.attacks[type].push(input);
    return data.attacks[type];
  },
  DeleteAttack: (request) => {
    const { name } = request;
    for (const type in data.attacks) {
      for (let i = 0; i < data.attacks[type].length; i++) {
        if (data.attacks[type][i].name === name) {
          return data.attacks[type].splice(i, 1);
        }
      }
    }
  },
  ModifyAttack: (request) => {
    const { name, input } = request;
    for (const type in data.attacks) {
      for (const attack of data.attacks[type]) {
        if (attack.name === name) {
          Object.assign(attack, input);
          return attack;
        }
      }
    }
  },
  AddPokemon: (request) => {
    const { input } = request;
    data.pokemon.push(input);
    return data.pokemon;
  },
  ModifyPokemon: (request) => {
    const { id, input } = request;
    for (const pokemon of data.pokemon) {
      if (pokemon.id === id) {
        Object.assign(pokemon, input);
        return pokemon;
      }
    }
  },
  DeletePokemon: (request) => {
    const { id } = request;
    for (const pokemon in data.pokemon) {
      if (data.pokemon[pokemon].id === id) {
        return data.pokemon.splice(pokemon, 1);
      }
    }
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
module.exports = { schema };
