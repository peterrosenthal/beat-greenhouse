const mm = require('@magenta/music/node/music_vae');

export default function handler(req, res) {
  let body;
  try {
    body = req.body;
  } catch (e) {
    return res.status(400).json({ error: `error while parsing request body: ${e}` });
  }
  if (!(body.parents instanceof Object)) {
    return res.status(400).json({ error: `'parents' object is required in request body` });
  }
  if (!(body.parents.a instanceof Object)) {
    return res.status(400).json({ error: `'parents' object in request body must contain object 'a'` });
  }
  if (!(body.parents.b instanceof Object)) {
    return res.status(400).json({ error: `'parents' object in request body must contain object 'b'` });
  }
  if (!(body.parameters instanceof Object)) {
    return res.status(400).json({ error: `'parameters' object is required in request body` });
  }
  if (typeof body.parameters.similarity !== 'number') {
    return res.status(400).json({ error: `'parameters' object in request body must contain number 'similarity'` });
  }
  if (typeof body.parameters.temperature !== 'number') {
    return res.status(400).json({ error: `'parameters' object in request body must contain number 'temperature'` });
  }
  if (typeof body.parameters.balance !== 'number') {
    return res.status(400).json({ error: `'parameters' object in request body must contain number 'balance'` });
  }
  try {
    const mvae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2');
    const parents = [];
    mvae.initialize().then(() => {
      return mvae.similar(body.parents.a, 1, skewedRandom(body.parameters.similarity), body.parameters.temperature);
    }).then((sequences) => {
      parents.push(sequences[0]);
      return mvae.similar(body.parents.b, 1, skewedRandom(body.parameters.similarity), body.parameters.temperature);
    }).then((sequences) => {
      parents.push(sequences[0]);
      return mvae.interpolate(parents, 10);
    }).then((sequences) => {
      const child = sequences[Math.floor(skewedRandom(0.5) * sequences.length)];
      return res.status(200).json({ child });
    });
  } catch (e) {
    return res.status(500).json({ error: `unexpected error: ${e}` });
  }
}

function skewedRandom(skew) {
  const pow = skew < 0.5 ? 0.5 / skew : (1 - skew) / 0.5;
  let u = 0;
  let v = 0;
  while (u === 0) {
    u = Math.random();
  }
  while (v === 0) {
    v = Math.random();
  }
  let num = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  num = num / 10 + 0.5;
  if (num < 0 || num > 1) {
    num = skewedRandom(skew);
  } else {
    num = Math.pow(num, pow);
  }
  return num;
}
