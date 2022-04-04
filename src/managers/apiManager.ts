const base = 'http://beat-greenhouse-git-functions-rosenthal.vercel.app/api';

export function init(): void {
  get('/combine', new URLSearchParams({ name: 'peter' }))
    .then((response: Record<string, unknown> | string) => {
      if (response instanceof Object && response.message !== undefined) {
        console.log(response.message);
      } else {
        console.log(response);
      }
    });
}

async function get(
  path: string,
  params?: URLSearchParams,
): Promise<Record<string, unknown> | string> {
  const paramstring = params instanceof URLSearchParams ? `?${params.toString()}` : '';
  return fetch(
    `${base}/${path}${paramstring}`,
    { method: 'GET' },
  ).then(function (response: Response) {
    return response.text();
  }).then(function(json: string) {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed === 'string' && parsed.includes('{')) {
        return JSON.parse(parsed);
      }
      return parsed;
    } catch (e) {
      return `couldn't parse string '${json}', error: ${e}`;
    }
  });
}
