const chai = require("chai");
const { pokemon, attacks, types } = require("../data");
const expect = chai.expect;
const url = `http://localhost:4000`;
const request = require("supertest")(url);

describe("GraphQl server", () => {
  it("should return all pokemon", async () => {
    const res = await request
      .post("/graphql")
      .send({ query: "{Pokemons{id}}" });
    expect(JSON.parse(res.text).data.Pokemons.length).to.equal(pokemon.length);
  });
});
