// import { MusicVAE, INoteSequence } from '@magenta/music/es6';
import { MusicVAE } from '@magenta/music/es6/music_vae';
import { INoteSequence } from '@magenta/music/es6/protobuf';
import { tensor2d } from '@tensorflow/tfjs';
import MusicParameters from './musicParameters';

const mvae = new MusicVAE('https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_q2');

export async function init(): Promise<void> {
  try {
    await mvae.initialize();
  } catch (error) {
    console.warn(`error during mvae initialization: ${error}`);
  }
}

export function getDefaultParameters(): MusicParameters {
  return {
    balance: 0.5,
    similarity: 0.8,
    temperature: 0.5,
  };
}

export async function encode(sequence: INoteSequence): Promise<Float32Array> {
  if (!mvae.initialized) {
    await init();
  }
  const tensor = await mvae.encode([sequence]);
  const array = (await tensor.array())[0];
  return Float32Array.from(array);
}

export async function decode(array : Float32Array): Promise<INoteSequence> {
  if (!mvae.initialized) {
    await init();
  }
  const tensor = tensor2d(array, [1, array.length]);
  const sequences = await mvae.decode(tensor);
  return sequences[0];
}

export async function combine(
  sequenceA: INoteSequence,
  sequenceB: INoteSequence,
  parameters = getDefaultParameters(),
): Promise<INoteSequence[]> {
  if (!mvae.initialized) {
    await init();
  }
  const numChildren = 12;
  const children: INoteSequence[] = [];
  for (let i = 0; i <= numChildren; i++) {
    const parents: INoteSequence[] = [];
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
    const results = await mvae.interpolate(parents, 3);
    children.push(results[1]);
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
