import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";
import isbot from "isbot";

const ABORT_DELAY = 5000;

function getEarlyHints(ctx: EntryContext, headers: Headers) {
  let resources = ctx.matches.flatMap((match) => [
    ctx.manifest.routes[match.route.id].module,
    ...(ctx.manifest.routes[match.route.id].imports || []),
  ]);

  for (const resource of resources) {
    headers.append("Link", `${resource}; rel="${getRel(resource)}"`);
  }
}

function getRel(resource: string) {
  if (resource.endsWith(".js")) {
    return "modulepreload";
  }
  return "preload";
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  // getEarlyHints(remixContext, responseHeaders);

  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callbackName]() {
          let body = new PassThrough();

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(body, {
              status: didError ? 500 : responseStatusCode,
              headers: responseHeaders,
            })
          );
          pipe(body);
        },
        onShellError(err) {
          reject(err);
        },
        onError(error) {
          didError = true;
          console.error(error);
        },
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
