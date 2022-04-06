const base = 'https://us-central1-beat-greenhouse.cloudfunctions.net';

export function init(): void {
  // do nothing for now I guess
}

async function send(
  method: string,
  path: string,
  params?: URLSearchParams,
  body?: string,
): Promise<Record<string, unknown> | string> {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  const paramstring = params instanceof URLSearchParams ? `?${params.toString()}` : '';
  return fetch(
    `${base}/${path}${paramstring}`,
    { method, headers, body },
  ).then(function (response: Response) {
    return response.text();
  }).then(function(json: string) {
    try {
      return JSON.parse(json);
    } catch (e) {
      return json;
    }
  });
}

export async function get(
  path: string,
  params?: URLSearchParams,
): Promise<Record<string, unknown> | string> {
  return send ('GET', path, params, undefined);
}

export async function post(
  path: string,
  _body: string | Record<string, unknown> | ArrayLike<unknown>,
) {
  const body = typeof _body !== 'string' ? JSON.stringify(_body) : _body;
  return send('POST', path, undefined, body);
}
