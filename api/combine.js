const mm = require('@magenta/music/node/music_vae');

export default function handler(request, response) {
  const mvae = new mm.MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2');
  mvae.initialize().then(() => {
    const { name = 'world' } = request.query;
    const responstring = JSON.stringify({
      message: `Hello ${name}! From an attempt at magenta shit!`,
    });
    response.status(200).send(JSON.stringify(responstring));
  });
}
