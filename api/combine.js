const mm_mvae = require('@magenta/music/node/music_vae');

export default function handler(request, response) {
  const mvae = new mm_mvae.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2);
  await mvae.initialize();
  const { name = 'world' } = request.query;
  response.status(200).send(`Hello ${name}! MVAE was able to init! I think?`);
}
