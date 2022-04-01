// based on the svelte-kit realworld example: https://github.com/sveltejs/realworld/blob/ecb902b/src/lib/api.js
const base = 'http://localhost:3000/api';

async function send({ method, path, data, headers }) {
  const options = { method, headers: headers ?? {} };

  options.headers['Content-Type'] = 'application/json';

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(`${base}/${path}`, options)
    .then(function (r) {
      return r.text();
    })
    .then(function (json) {
      try {
        return JSON.parse(json);
      } catch (error) {
        return json;
      }
    });
}

export function get(path, headers = undefined) {
  return send({ method: 'GET', path, headers });
}
