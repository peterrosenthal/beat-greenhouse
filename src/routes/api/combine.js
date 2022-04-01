import { MusicVAE } from '@magenta/music/es6/music_vae';

export async function get() {
  console.log(MusicVAE);
  /*
  const mvae = mm.MusicVAE();
  await mvae.initialize();
  const sequences = await mvae.sample(1);
  const tensors = await mvae.encode(sequences);
  const encoding = await tensors[0].array();
  */
  return {
    body: {
      test: 'test',
    },
  };
}
