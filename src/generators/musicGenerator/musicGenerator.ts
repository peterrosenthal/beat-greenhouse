import * as mm from '@magenta/music/es6';
import { tensor2d } from '@tensorflow/tfjs';
import MusicParameters from './musicParameters';

const parameters = getDefaultParameters();

const mvae = new mm.MusicVAE(parameters.checkpoint);

export function getDefaultParameters(): MusicParameters {
  return {
    checkpoint: 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2',
    balance: 0.5,
    similarity: 0.25,
    temperature: 0.5,
  };
}

export async function encode(sequence: mm.INoteSequence): Promise<Float32Array> {
  const tensor = await mvae.encode([sequence]);
  const array = (await tensor.array())[0];
  return Float32Array.from(array);
}

export async function decode(array : Float32Array): Promise<mm.INoteSequence> {
  const tensor = tensor2d(array, [1, array.length]);
  const sequences = await mvae.decode(tensor);
  return sequences[0];
}
