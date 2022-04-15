import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';
import PlantParameters from './parameters/PlantParameters';
import PlantNode from './PlantNode';
import Plant from './Plant';

const simplex = new SimplexNoise('Beat Greenhouse');

export async function generatePlant(parameters: PlantParameters): Promise<Plant> {
  // step 1: generate attraction points
  const attractors = generateInitialAttractors(parameters);

  console.log(parameters.leaves.phiAverage);

  // step 2: generate nodes from attractors
  const nodes = generateNodes(attractors, parameters);

  // step 3: create a plant out of the nodes
  const plant = new Plant(nodes, parameters);

  return plant;
}

export function getDefaultParameters(): PlantParameters {
  return {
    envelope: {
      radius: 10,
      height: 10,
      position: new THREE.Vector3(0, 2, 0),
      handles: {
        bot: {
          first: 0.2,
          second: 0.2,
          third: 0.2,
        },
        mid: {
          first: 0.5,
          second: 0.5,
          third: 0.5,
        },
        top: {
          first: 0.3,
          second: 0.6,
          third: 0.45,
        },
        heights: {
          bot: 0.12,
          mid: 0.54,
          top: 0.96,
        },
      },
    },
    attraction: {
      noise: {
        offset: new THREE.Vector3(0, 0, 0),
        scale: 5,
        threshold: {
          value: 0.9,
          skew: {
            location: 0.5,
            amount: 0.5,
          },
        },
      },
      radius: 5,
      kill: 0.8,
    },
    growth: {
      iterations: 80,
      reach: 0.1,
      thickness: {
        fast: 0.001,
        slow: 0.0001,
        combination: 2.5,
      },
    },
    leaves: {
      maxBranchThickness: 0.01,
      size: 0.1,
      theta: 1.618,
      phiAverage: 0.75,
      phiRandomness: 0.1,
      verticalDensity: 1,
    },
    materials: {
      branches: {
        color: {
          hue: 0.0854,
          sat: 0.6119,
          lit: 0.2627,
        },
        roughness: 0.8,
      },
      leaves: {
        color: {
          hue: 0.3788,
          sat: 0.4208,
          lit: 0.3588,
        },
        roughness: 0.8,
      },
    },
  };
}

export function getRandomParameters(): PlantParameters {
  const latentSpaceVector = generateRandomLatentSpaceVector();
  return getParametersFromEncoding(latentSpaceVector);
}


export function generateRandomLatentSpaceVector(): Float32Array {
  const latentSpaceVector = new Float32Array(256);
  let length = 0;
  for (let i = 0; i < 256; i++) {
    latentSpaceVector[i] = Math.random() - 0.5;
    length += latentSpaceVector[i] * latentSpaceVector[i];
  }
  length = Math.sqrt(length);
  for (let i = 0; i < 256; i++) {
    latentSpaceVector[i] /= length;
  }
  return latentSpaceVector;
}

export function getParametersFromEncoding(encoding: Float32Array): PlantParameters {
  // first define a little helper function that can make a
  // random distrubution more or less dense using powers
  function signedAbsPow(value: number, power: number): number {
    return Math.sign(value) * Math.pow(Math.abs(value), power);
  }

  // step 1: reduce encoding into however many dimensions we can actually make use of
  // currently that number of dimensions is... 45... I think
  const dimensions = 45;
  const reduced = new Float32Array(dimensions);
  for (let i = 0; i < encoding.length; i++) {
    const power = Math.ceil((i + 1) / dimensions);
    reduced[i % dimensions] += Math.pow(encoding[i], power);
  }
  // normalize the reduced vector
  let length = 0;
  for (let i = 0; i < dimensions; i++) {
    length += reduced[i] * reduced[i];
  }
  length = Math.sqrt(length);
  for (let i = 0; i < dimensions; i++) {
    reduced[i] /= length;
  }

  // create a set of parameters out of the reduced vector
  return {
    envelope: {
      radius: (reduced[0] + 1) * 7,
      height: (signedAbsPow(reduced[1], 0.2) + 1) * 2.5 + 1.25,
      position: new THREE.Vector3(
        signedAbsPow(reduced[2], 0.25),
        reduced[3] * 0.05 + 0.4,
        signedAbsPow(reduced[4], 0.25),
      ),
      handles: {
        bot: {
          first: signedAbsPow(reduced[5], 0.25) * 0.3 + 0.3,
          second: signedAbsPow(reduced[6], 0.25) * 0.3 + 0.3,
          third: signedAbsPow(reduced[7], 0.25) * 0.3 + 0.3,
        },
        mid: {
          first: signedAbsPow(reduced[8], 0.25) * 0.35 + 0.5,
          second: signedAbsPow(reduced[9], 0.25) * 0.35 + 0.5,
          third: signedAbsPow(reduced[10], 0.25) * 0.35 + 0.5,
        },
        top: {
          first: signedAbsPow(reduced[11], 0.25) * 0.5 + 0.5,
          second: signedAbsPow(reduced[12], 0.25) * 0.5 + 0.5,
          third: signedAbsPow(reduced[13], 0.25) * 0.5 + 0.5,
        },
        heights: {
          bot: signedAbsPow(reduced[14], 0.25) * 0.09 + 0.12,
          mid: signedAbsPow(reduced[15], 0.25) * 0.21 + 0.54,
          top: signedAbsPow(reduced[16], 0.25) * 0.04 + 0.95,
        },
      },
    },
    attraction: {
      noise: {
        offset: new THREE.Vector3(
          reduced[17] * 10,
          reduced[18] * 10,
          reduced[19] * 10,
        ),
        scale: reduced[20] * 0.5 + 5,
        threshold: {
          value: reduced[21] * 0.08 + 0.89,
          skew: {
            location: reduced[22] * 0.5 + 0.5,
            amount: Math.abs(reduced[23]),
          },
        },
      },
      radius: signedAbsPow(reduced[24], 0.25) * 1.5 + 1.8,
      kill: (signedAbsPow(reduced[24], 0.25) * 1.5 + 1.8) *
        (signedAbsPow(reduced[25], 0.25) * 0.3 + 0.4),
    },
    growth: {
      iterations: Math.round(reduced[26] * 45 + 60),
      reach: reduced[27] * 0.15 + 0.2,
      thickness: {
        fast: signedAbsPow(reduced[28], 0.25) * 0.0025 + 0.0052,
        slow: signedAbsPow(reduced[29], 0.5) * 0.00005 + 0.0002,
        combination: reduced[30] + 3,
      },
    },
    leaves: {
      maxBranchThickness: signedAbsPow(reduced[31], 0.2) * 0.012 + 0.011,
      size: reduced[32] * 0.2 + 0.2,
      theta: (signedAbsPow(reduced[33], 0.125) * 3 * Math.PI + Math.PI) % (Math.PI * 2),
      phiAverage: signedAbsPow(reduced[34], 0.2) * Math.PI / 2 + Math.PI / 2,
      phiRandomness: signedAbsPow(reduced[35], 0.25) * 0.25 + 0.25,
      verticalDensity: signedAbsPow(reduced[36], 0.125) * 1.3 + 2.2,
    },
    materials: {
      branches: {
        color: {
          hue: ((reduced[37] + 1) * 50) % 1,
          sat: signedAbsPow(reduced[38], 0.2) * 0.5 + 0.55,
          lit: signedAbsPow(reduced[39], 0.2) * 0.45 + 0.45,
        },
        roughness: signedAbsPow(reduced[40], 0.25) * 0.4 + 0.6,
      },
      leaves: {
        color: {
          hue: ((reduced[41] + 1) * 50) % 1,
          sat: signedAbsPow(reduced[42], 0.2) * 0.45 + 0.7,
          lit: signedAbsPow(reduced[43], 0.2) * 0.45 + 0.45,
        },
        roughness: signedAbsPow(reduced[44], 0.25) * 0.4 + 0.6,
      },
    },
  };
}

function generateInitialAttractors(parameters = getDefaultParameters()): THREE.Vector3[] {
  const attractors: THREE.Vector3[] = [];

  // these "resolutions" may or may not become externally controlled factors
  // or they might become based upon other externally controlled factors
  // but for now they are just internal constants
  const resolution = {
    horizontal: 10000,
    vertical: 160,
  };


  // at each vertical step, send out a spiral of points to check if they
  // land on a peak location of the noise function
  for (let i = 0; i < resolution.vertical; i++) {
    let height = i / resolution.vertical;
    /* eslint-disable indent */
    // "smootherstep" lerp between the 3 vertical layers of envelope shape nodes
    // so that we can check if the point is within the envelope
    const first = height < parameters.envelope.handles.heights.top ?
                  height < parameters.envelope.handles.heights.mid ?
                  height < parameters.envelope.handles.heights.bot ?
                    THREE.MathUtils.lerp(
                      0,
                      parameters.envelope.handles.bot.first,
                      THREE.MathUtils.smootherstep(
                        height,
                        0,
                        parameters.envelope.handles.heights.bot,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.bot.first,
                      parameters.envelope.handles.mid.first,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.bot,
                        parameters.envelope.handles.heights.mid,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.mid.first,
                      parameters.envelope.handles.top.first,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.mid,
                        parameters.envelope.handles.heights.top,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.top.first,
                      0,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.top,
                        1,
                      ),
                    );
    const second = height < parameters.envelope.handles.heights.top ?
                   height < parameters.envelope.handles.heights.mid ?
                   height < parameters.envelope.handles.heights.bot ?
                    THREE.MathUtils.lerp(
                      0,
                      parameters.envelope.handles.bot.second,
                      THREE.MathUtils.smootherstep(
                        height,
                        0,
                        parameters.envelope.handles.heights.bot,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.bot.second,
                      parameters.envelope.handles.mid.second,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.bot,
                        parameters.envelope.handles.heights.mid,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.mid.second,
                      parameters.envelope.handles.top.second,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.mid,
                        parameters.envelope.handles.heights.top,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.top.second,
                      0,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.top,
                        1,
                      ),
                    );
    const third = height < parameters.envelope.handles.heights.top ?
                  height < parameters.envelope.handles.heights.mid ?
                  height < parameters.envelope.handles.heights.bot ?
                    THREE.MathUtils.lerp(
                      0,
                      parameters.envelope.handles.bot.third,
                      THREE.MathUtils.smootherstep(
                        height,
                        0,
                        parameters.envelope.handles.heights.bot,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.bot.third,
                      parameters.envelope.handles.mid.third,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.bot,
                        parameters.envelope.handles.heights.mid,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.mid.third,
                      parameters.envelope.handles.top.third,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.mid,
                        parameters.envelope.handles.heights.top,
                      ),
                    ):
                    THREE.MathUtils.lerp(
                      parameters.envelope.handles.top.third,
                      0,
                      THREE.MathUtils.smootherstep(
                        height,
                        parameters.envelope.handles.heights.top,
                        1,
                      ),
                    );
    /* eslint-enable indent */
    
    // scale the height value by the envelope size
    height *= parameters.envelope.height;

    // perform a spiral search
    const PHI = (1 * Math.sqrt(5)) / 2;
    for (
      let theta = 0, r = 0;
      r < parameters.envelope.radius;
      theta = (theta + 2 * Math.PI * PHI) % (2 * Math.PI),
      r += parameters.envelope.radius / ((r > 0.2 ? r : 0.1) * resolution.horizontal)
    ) {
      const maxRadius = (parameters.envelope.radius / 2)
        * (theta < 4 * Math.PI / 3 ? theta < 2 * Math.PI / 3 ?
          THREE.MathUtils.lerp(
            first,
            second,
            THREE.MathUtils.smootherstep(theta, 0, 2 * Math.PI / 3),
          ):
          THREE.MathUtils.lerp(
            second,
            third,
            THREE.MathUtils.smootherstep(theta, 2 * Math.PI / 3, 4 * Math.PI / 3),
          ):
          THREE.MathUtils.lerp(
            third,
            first,
            THREE.MathUtils.smootherstep(theta, 4 * Math.PI / 3, 2 * Math.PI),
          )
        );
      
      if (r > maxRadius) {
        continue;
      }

      const point = new THREE.Vector3(
        parameters.envelope.position.x + Math.cos(theta) * r,
        parameters.envelope.position.y + height,
        parameters.envelope.position.z + Math.sin(theta) * r,
      );
      const radius = r / maxRadius;
      /* eslint-disable indent */
      const skew = parameters.attraction.noise.threshold.skew.amount
        * Math.min(
          parameters.attraction.noise.threshold.value - 0.58,
          0.99 - parameters.attraction.noise.threshold.value,
        )
        * (parameters.attraction.noise.threshold.skew.location < 1 ?
           parameters.attraction.noise.threshold.skew.location < 0.9 ?
           parameters.attraction.noise.threshold.skew.location < 0.1 ?
           parameters.attraction.noise.threshold.skew.location === 0 ?
          THREE.MathUtils.lerp(1, -1, radius):
          (radius < parameters.attraction.noise.threshold.skew.location ?
            THREE.MathUtils.lerp(
              0,
              1,
              radius / parameters.attraction.noise.threshold.skew.location,
            ):
            THREE.MathUtils.lerp(
              1,
              -1,
              (radius - parameters.attraction.noise.threshold.skew.location)
                / (1 - parameters.attraction.noise.threshold.skew.location),
            )
          ):
          (radius < parameters.attraction.noise.threshold.skew.location ?
            THREE.MathUtils.lerp(
              -1,
              1,
              radius / parameters.attraction.noise.threshold.skew.location,
            ):
            THREE.MathUtils.lerp(
              1,
              -1,
              (radius - parameters.attraction.noise.threshold.skew.location)
                / (1 - parameters.attraction.noise.threshold.skew.location),
            )
          ):
          (radius < parameters.attraction.noise.threshold.skew.location ?
            THREE.MathUtils.lerp(
              -1,
              1,
              radius / parameters.attraction.noise.threshold.skew.location,
            ):
            THREE.MathUtils.lerp(
              1,
              0,
              (radius - parameters.attraction.noise.threshold.skew.location)
                / (1 - parameters.attraction.noise.threshold.skew.location),
            )
          ):
          THREE.MathUtils.lerp(-1, 1, radius)
        );
      /* eslint-enable indent */
      const threshold = parameters.attraction.noise.threshold.value - skew;
      const sample = point
        .clone()
        .multiplyScalar(parameters.attraction.noise.scale)
        .add(parameters.attraction.noise.offset);
      const noise = simplex.noise3D(sample.x, sample.y, sample.z);
      if (noise > threshold) {
        attractors.push(point);
      }
    }
  }

  return attractors;
}

function generateNodes(
  attractors: THREE.Vector3[],
  parameters = getDefaultParameters(),
): PlantNode[] {
  // first node of the stem + branches is at local point (0, 0, 0)
  const nodes: PlantNode[] = [];
  const root: PlantNode = {
    parent: undefined,
    children: [],
    position: new THREE.Vector3(),
    attractors: [],
    radius: 0,
    leaves: [],
  };
  nodes.push(root);

  // iteratively add nodes through a space colonization algorithm
  let mature = false;
  for (let i = 0; i < parameters.growth.iterations; i++) {
    // step 1 of each iteration:
    // find the closest node within attraction distance to each attractor
    let outOfRange = !mature;
    for (const attractor of attractors) {
      let closest: PlantNode | undefined;
      let distance = parameters.attraction.radius;
      for (const node of nodes) {
        if (attractor.distanceTo(node.position) < distance) {
          outOfRange = false;
          closest = node;
          distance = attractor.distanceTo(closest.position);
        }
      }
      closest?.attractors.push(attractor);
    }

    // step 2 of each iteration:
    // add nodes
    if (outOfRange) {
      // if no attractors are close enough, we need to just add a singular node
      // that grows towards the center of mass of all the attractors
      const centerOfMass = new THREE.Vector3();
      for (const attractor of attractors) {
        centerOfMass.add(attractor);
      }
      centerOfMass.divideScalar(attractors.length);
      const parent = nodes[nodes.length - 1];
      const child: PlantNode = {
        parent: parent,
        children: [],
        position: parent.position
          .clone()
          .add(
            centerOfMass
              .clone()
              .sub(parent.position)
              .normalize()
              .multiplyScalar(parameters.growth.reach)
          ),
        attractors: [],
        radius: 0,
        leaves: [],
      };
      parent.children.push(child);
      nodes.push(child);
    } else {
      // if there are attractors successfully at play, then we can loop through
      // all the nodes and add even more nodes based on the direction towards
      // the center of mass of the few attractors that are affecting that individual node
      const newNodes: PlantNode[] = [];
      for (const node of nodes) {
        if (node.attractors.length > 0) {
          mature = true;
          const centerOfMass = new THREE.Vector3();
          for (const attractor of node.attractors) {
            centerOfMass.add(attractor);
          }
          centerOfMass.divideScalar(node.attractors.length);
          const child: PlantNode = {
            parent: node,
            children: [],
            position: node.position
              .clone()
              .add(
                centerOfMass
                  .clone()
                  .sub(node.position)
                  .normalize()
                  .multiplyScalar(parameters.growth.reach)
              ),
            attractors: [],
            radius: 0,
            leaves: [],
          };
          node.children.push(child);
          newNodes.push(child);
        }
      }
      nodes.push(...newNodes);
    }

    // step 3 of each iteration:
    // clear each node's attractors
    for (const node of nodes) {
      node.attractors = [];
    }

    // step 4 of each iteration:
    // remove attractors that have been reached by a node within the "kill distance"
    attractors = attractors.filter(function(attractor) {
      for (const node of nodes) {
        if (attractor.distanceTo(node.position) < parameters.attraction.kill) {
          return false;
        }
      }
      return true;
    });
  }

  // calculate the radius of the stem/branches at each node based on how
  // many (recursively) children nodes they have on the tree
  for (const node of nodes) {
    // always start from the end of each branch the tree (no children)
    if (node.children.length === 0) {
      let growth = parameters.growth.thickness.fast;
      let delta = 0;
      let current: PlantNode | undefined = node;
      let previous: PlantNode | undefined;
      let safety = 0;
      while (current !== undefined) {
        if (safety > parameters.growth.iterations) {
          console.warn('The tree must have formed a loop somewhere!');
          break;
        }
        safety ++;

        // slow down the growth once we have combined with an existing branch
        if (current.radius !== 0 && growth !== parameters.growth.thickness.slow) {
          growth = parameters.growth.thickness.slow;
        }

        if (current.children.length > 1 && previous !== undefined) {
          // if the node has more than 1 child then we have a combination happening
          // and we need to use the thickness combinaton factor to smooth it out
          let radius = 0;
          for (const child of current.children) {
            radius += Math.pow(child.radius, parameters.growth.thickness.combination);
          }
          radius = Math.pow(radius, 1 / parameters.growth.thickness.combination);
          delta = radius - current.radius;
          current.radius = radius;
        } else {
          // if no combination is happening then we just have to add delta
          current.radius += delta;
        }
        current.radius = THREE.MathUtils.clamp(current.radius, 0, 0.5);

        delta += growth;
        previous = current;
        current = current.parent;
      }
    }
  }

  // add leaves to each node
  for (const node of nodes) {
    if (node.radius > parameters.leaves.maxBranchThickness) {
      continue;
    }
    const leafDistance = 1 / parameters.leaves.verticalDensity;
    let height = 0;
    let theta = 0;
    if (node.parent !== undefined && node.parent.leaves.length > 0) {
      const lastLeaf = node.parent.leaves[node.parent.leaves.length - 1];
      height = leafDistance - (1 - lastLeaf.height);
      theta = lastLeaf.theta + parameters.leaves.theta;
    }
    while (height < 1) {
      const psi = (Math.random() * 0.5)
        * parameters.leaves.phiRandomness + parameters.leaves.phiAverage;
      const size = parameters.leaves.size;
      node.leaves.push({ height, size, psi, theta });

      height += leafDistance;
      theta += parameters.leaves.theta;
    }
  }

  return nodes;
}

