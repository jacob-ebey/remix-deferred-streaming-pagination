import { deferred, json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { Deferred, useDeferredData, useLoaderData } from "@remix-run/react";

import { getPokemon } from "~/pokemon";

type LoaderData = {
  id: string;
  pokemon:
    | Awaited<ReturnType<typeof getPokemon>>
    | ReturnType<typeof getPokemon>;
};

export const loader: LoaderFunction = async ({ params: { id } }) => {
  if (!id) throw json(null, 404);

  const pokemonPromise = getPokemon({ id });

  return deferred<LoaderData>(
    {
      id,
      pokemon: pokemonPromise,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }
  );
};

export default function Pokemon() {
  const { id, pokemon } = useLoaderData() as LoaderData;

  return (
    <main>
      <article>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
          height="96"
          width="96"
          alt=""
        />
        <Deferred value={pokemon} fallback="">
          <DeferredPokemonDetails />
        </Deferred>
      </article>
    </main>
  );
}

function DeferredPokemonDetails() {
  const pokemon = useDeferredData() as Awaited<ReturnType<typeof getPokemon>>;

  return (
    <>
      <h1>{pokemon.name}</h1>
      <p>
        <strong>ID:</strong> {pokemon.id}
      </p>
      <p>
        <strong>Height:</strong> {pokemon.height}
      </p>
      <p>
        <strong>Weight:</strong> {pokemon.weight}
      </p>
      <p>
        <strong>Types:</strong>
        <ul>
          {(pokemon.types || []).map(
            ({ type }) => !!type && <li key={type.name}>{type.name}</li>
          )}
        </ul>
      </p>
    </>
  );
}
