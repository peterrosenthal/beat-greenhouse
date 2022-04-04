export default function handler(req, res) {
  const { name = 'world' } = req.query;
  res.status(200).send(`Hello ${name}!`);
}
