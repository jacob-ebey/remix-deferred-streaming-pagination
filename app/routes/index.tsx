import { deferred, LoaderFunction } from "@remix-run/node";
import {
  Deferred,
  Link,
  useDeferredData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";

import { getAllPokemon } from "~/pokemon";

type LoaderData = {
  first10:
    | Awaited<ReturnType<typeof getAllPokemon>>
    | ReturnType<typeof getAllPokemon>;
  rest:
    | Awaited<ReturnType<typeof getAllPokemon>>
    | ReturnType<typeof getAllPokemon>;
};

const PER_PAGE = 50;
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 0);
  const offset = page * PER_PAGE;

  // Start loading the first 10 pokemon
  const first10Promise = getAllPokemon({ offset, limit: 10 });
  // Start loading the next 40 pokemon
  const restPromise = getAllPokemon({
    offset: offset + 10,
    limit: PER_PAGE - 10,
  });

  return deferred<LoaderData>(
    {
      // Wait for the first 10 pokemon to load
      first10: await first10Promise,
      // Don't wait for the next 40 pokemon to load
      rest: restPromise,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    }
  );
};

export default function Index() {
  const { first10, rest } = useLoaderData() as LoaderData;
  const [searchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 0);

  const nextPageTo = {
    pathname: "/",
    search: `?page=${page + 1}`,
  };

  return (
    <main>
      <article>
        <ul>
          {/* The first 10 render in their own Deferred incase we decide to not await it */}
          <Deferred value={first10} fallback="">
            <DeferedPokemonItems />
          </Deferred>
          <Deferred
            value={rest}
            fallback={
              <p>
                <Link to={nextPageTo}>Next Page</Link>
              </p>
            }
            errorElement={
              <p>
                <Link to={nextPageTo}>Next Page</Link>
              </p>
            }
          >
            <DeferedPokemonItems />
            <p>
              <Link to={nextPageTo}>Next Page</Link>
            </p>
          </Deferred>
        </ul>
      </article>
    </main>
  );
}

function DeferedPokemonItems() {
  // Get the data from the parent Deferred
  const pokemonList = useDeferredData() as Awaited<
    ReturnType<typeof getAllPokemon>
  >;

  return (
    <>
      {pokemonList.map(({ id, name }) => (
        <li key={id} style={{ display: "flex", alignItems: "center" }}>
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
            height="40"
            width="40"
            style={{ marginRight: "0.75em", marginLeft: "0" }}
            alt=""
          />
          <Link to={`/pokemon/${id}`}>{name}</Link>
        </li>
      ))}
    </>
  );
}
