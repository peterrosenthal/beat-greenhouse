const base = 'https://beat-greenhouse-git-functions-rosenthal.vercel.app/api';

export function init(): void {
  get('hello', new URLSearchParams({ name: 'peter' }))
    .then((response: Record<string, unknown> | string) => {
      if (response instanceof Object && response.message !== undefined) {
        console.log(response.message);
      } else {
        console.log(response);
      }
    });
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
