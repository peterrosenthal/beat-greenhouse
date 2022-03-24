import * as mm from '@magenta/music/es6';
import { tensor2d } from '@tensorflow/tfjs';
import MusicParameters from './musicParameters';

export const parameters = getDefaultParameters();

const mvae = new mm.MusicVAE(parameters.checkpoint);
mvae.initialize();

export function getDefaultParameters(): MusicParameters {
  return {
    checkpoint: 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2',
    balance: 0.5,
    similarity: 0.8,
    temperature: 0.5,
  };
}

export async function encode(sequence: mm.INoteSequence): Promise<Float32Array> {
  if (!mvae.initialized) {
    await mvae.initialize();
  }
  const tensor = await mvae.encode([sequence]);
  const array = (await tensor.array())[0];
  return Float32Array.from(array);
}

export async function decode(array : Float32Array): Promise<mm.INoteSequence> {
  if (!mvae.initialized) {
    await mvae.initialize();
  }
  const tensor = tensor2d(array, [1, array.length]);
  const sequences = await mvae.decode(tensor);
  return sequences[0];
}

export async function combine(
  sequenceA: mm.INoteSequence,
  sequenceB: mm.INoteSequence,
): Promise<mm.INoteSequence[]> {
  if (!mvae.initialized) {
    await mvae.initialize();
  }
  const numChildren = 20;
  const children: mm.INoteSequence[] = [];
  for (let i = 0; i <= numChildren; i++) {
    const parents: mm.INoteSequence[] = [];
    parents.push((await mvae.similar(
      sequenceA,
      1,
      skewedRandom(parameters.similarity),
      parameters.temperature,
    ))[0]);
    parents.push((await mvae.similar(
      sequenceB,
      1,
      skewedRandom(parameters.similarity),
      parameters.temperature,
    ))[0]);
    const results = await mvae.interpolate(parents, 50);
    children.push(results[Math.floor(skewedRandom(0.5) * results.length)]);
  }
  return children;
}

function skewedRandom(skew: number): number {
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
