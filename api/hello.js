export default function handler(request, response) {
  const { name = 'world' } = request.query;
  response.status(200).send(`Hello ${name}!`);
}
