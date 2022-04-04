export default function handler(req, res) {
  const { name = 'world' } = req.query;
  response.status(200).send(`Hello ${name}!`);
}
