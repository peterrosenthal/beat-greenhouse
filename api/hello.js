/*
export default function handler(request, response) {
  const { name = 'world' } = request.query;
  response.status(200).send(`Hello ${name}!`);
}
*/
const mm = require('@magenta/music/node/music_vae');

module.exports = (request, response) => {
  const { name = 'world' } = request.query;
  response.status(200).send(`Hello ${name}!`);
}
