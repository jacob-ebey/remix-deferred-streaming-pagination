import { useState } from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Deferred Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/awsm.css@3.0.7/dist/awsm.min.css",
  },
];

export default function App() {
  let [count, setCount] = useState(0);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <h1>Deferred Remix App</h1>
          <p>
            <code>deferred()</code> data in Remix is a killer feature
          </p>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </nav>
        </header>
        <p>
          <button onClick={() => setCount(count + 1)}>Count: {count}</button>
        </p>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
