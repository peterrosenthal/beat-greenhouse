import * as THREE from 'three';
import GameManager from '../Managers/GameManager';

interface Node {
  position: THREE.Vector3,
  attractors: THREE.Vector3[],
}

export default class PlantGenerator {
  // envelope
  envelopeSize: number;
  envelopePosition: THREE.Vector3;
  envelopeNodes: Record<string, number>;

  // attractors
  numAttractors: number;
  attractionRadius: number;
  killDistance: number;

  // growth
  numIterations: number;
  growthSpeed: number;

  // what to visualize
  visualizeEnvelope: boolean;
  visualizeAttractors: boolean;
  visualizeNodes: boolean;

  constructor() {
    // envelope
    this.envelopeSize = 10;
    this.envelopePosition = new THREE.Vector3(0, 2, 0);
    this.envelopeNodes = {
      firstBot: 0.2,
      secondBot: 0.2,
      thirdBot: 0.2,
      firstMid: 0.5,
      secondMid: 0.5,
      thirdMid: 0.5,
      firstTop: 0.3,
      secondTop: 0.6,
      thirdTop: 0.45,
    };

    // attractors
    this.numAttractors = 500;
    this.attractionRadius = 5;
    this.killDistance = 0.8;

    // growth
    this.numIterations = 30;
    this.growthSpeed = 0.1;

    // what to visualize
    this.visualizeEnvelope = true;
    this.visualizeAttractors = false;
    this.visualizeNodes = false;
  }

  generate(): void {
    // final plant object is a group that may include many different parts
    const plant = new THREE.Group();

    // visualize attraction envelope
    if (this.visualizeEnvelope) {
      this.visualizeEnvelopeMesh(plant);
    }

    // generate attraction points
    const attractors = this.generateInitialAttractors();

    // visualize the attraction points in a buffergeometry to verify it's working
    if (this.visualizeAttractors) {
      this.visualizeAttractorPoints(plant, attractors);
    }

    const nodes = this.generateNodes(attractors);

    // visualize the nodes in a buffergeometry to verify it is working
    if (this.visualizeNodes) {
      this.visualizeNodePoints(plant, nodes);
    }

    const scene = GameManager.getInstance().scene;
    scene.traverse(function(object) { scene.remove(object); });
    scene.add(plant);
  }

  private generateInitialAttractors(): THREE.Vector3[] {
    const attractors: THREE.Vector3[] = [];
    for (let i = 0; i < this.numAttractors; i++) {
      // get random height and deterine what the 3 lateral boundary points at that height
      let height = Math.random();
      const first = height < 0.96 ? height < 0.54 ? height < 0.12 ?
        THREE.MathUtils.lerp(
          0,
          this.envelopeNodes.firstBot,
          height / 0.12,
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstBot,
          this.envelopeNodes.firstMid,
          (height - 0.12) / (0.54 - 0.12),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstMid,
          this.envelopeNodes.firstTop,
          (height - 0.54) / (0.96 - 0.54),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstTop,
          0,
          (height - 0.96) / (1 - 0.96),
        );
      const second = height < 0.96 ? height < 0.54 ? height < 0.12 ?
        THREE.MathUtils.lerp(
          0,
          this.envelopeNodes.secondBot,
          height / 0.12,
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondBot,
          this.envelopeNodes.secondMid,
          (height - 0.12) / (0.54 - 0.12),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondMid,
          this.envelopeNodes.secondTop,
          (height - 0.54) / (0.96 - 0.54),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondTop,
          0,
          (height - 0.96) / (1 - 0.96),
        );
      const third = height < 0.96 ? height < 0.54 ? height < 0.12 ?
        THREE.MathUtils.lerp(
          0,
          this.envelopeNodes.thirdBot,
          height / 0.12,
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdBot,
          this.envelopeNodes.thirdMid,
          (height - 0.12) / (0.54 - 0.12),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdMid,
          this.envelopeNodes.thirdTop,
          (height - 0.54) / (0.96 - 0.54),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdTop,
          0,
          (height - 0.96) / (1 - 0.96),
        );
      height *= this.envelopeSize;

      // get random angle
      const theta = Math.random() * 2 * Math.PI;

      // get random radius and scale it by the interpolated boundary
      let radius = theta < 4 * Math.PI / 3 ? theta < 2 * Math.PI / 3 ?
        THREE.MathUtils.lerp(first, second, theta / (2 * Math.PI / 3)):
        THREE.MathUtils.lerp(second, third, theta / (2 * Math.PI / 3) - 1):
        THREE.MathUtils.lerp(third, first, theta / (2 * Math.PI / 3) - 2);
      radius *= (1 - Math.pow(Math.random(), 2)) * this.envelopeSize / 2;
      attractors.push(new THREE.Vector3(
        this.envelopePosition.x + Math.cos(theta) * radius,
        this.envelopePosition.y + height,
        this.envelopePosition.z + Math.sin(theta) * radius,
      ));
    }
    return attractors;
  }

  private generateNodes(attractors: THREE.Vector3[]): Node[] {
    // first node of the stem + branches is at local point (0,0,0)
    const nodes: Node[] = [];
    nodes.push({
      position: new THREE.Vector3(),
      attractors: [],
    });
    // iteratively add nodes through a space colonization algorithm
    let plantIsMature = false;
    for (let i = 0; i < this.numIterations; i++) {
      // find the node that is closest (and within attraction distance) to each attractor
      let noAttractorCloseEnough = !plantIsMature;
      for (const attractor of attractors) {
        let closestNode: Node | undefined;
        let closestDistance = this.attractionRadius;
        for (const node of nodes) {
          if (attractor.distanceTo(node.position) < closestDistance) {
            noAttractorCloseEnough = false;
            closestNode = node;
            closestDistance = attractor.distanceTo(closestNode.position);
          }
        }
        closestNode?.attractors.push(attractor);
      }

      // add nodes
      if (noAttractorCloseEnough) {
        // if no attractors are close enough, we need to just add a singular node
        // that grows towards the center of mass of all the attractors
        const centerOfMass = new THREE.Vector3();
        for (const attractor of attractors) {
          centerOfMass.add(attractor);
        }
        centerOfMass.divideScalar(this.numAttractors);
        const lastNode = nodes[nodes.length - 1];
        nodes.push({
          position: lastNode.position.clone().add(
            centerOfMass
              .clone()
              .sub(lastNode.position)
              .normalize()
              .multiplyScalar(this.growthSpeed),
          ),
          attractors: [],
        });
      } else {
        // if there are attractors successfully at play then we can loop through
        // all the nodes and add even more nodes based on the direction towards
        // the center of mass of the few attractors that are affecting that individual node
        const nodesToAdd: Node[] = [];
        for (const node of nodes) {
          if (node.attractors.length > 0) {
            plantIsMature = true;
            const centerOfMass = new THREE.Vector3();
            for (const attractor of node.attractors) {
              centerOfMass.add(attractor);
            }
            centerOfMass.divideScalar(node.attractors.length);
            nodesToAdd.push({
              position: node.position.clone().add(
                centerOfMass
                  .clone()
                  .sub(node.position)
                  .normalize()
                  .multiplyScalar(this.growthSpeed),
              ),
              attractors: [],
            });
          }
        }
        nodes.push(...nodesToAdd);
      }

      // clear each node's attractors
      for (const node of nodes) {
        node.attractors = [];
      }

      // remove attractors that have been reached by a node within the "kill distance"
      const attractorsToRemove: THREE.Vector3[] = [];
      for (const attractor of attractors) {
        for (const node of nodes) {
          if (attractor.distanceTo(node.position) < this.killDistance) {
            attractorsToRemove.push(attractor);
            break;
          }
        }
      }
      attractors = attractors.filter(function(attractor) {
        for (const attractorToRemove of attractorsToRemove) {
          if (attractor === attractorToRemove) {
            return false;
          }
        }
        return true;
      });
    }

    return nodes;
  }

  private visualizeEnvelopeMesh(parent: THREE.Object3D): void {
    const resolution = 12;
    const layers = 5;
    const points: THREE.Vector3[] = [];
    // first point at the bottom center of the envelope
    points.push(this.envelopePosition);
    // add 5 "layers" of 12 points each between the top and the bottom
    for (let i = 0; i < layers; i++) {
      const mid = (layers - 1) / 2;
      const first = i < mid ?
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstBot,
          this.envelopeNodes.firstMid,
          i / mid,
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstMid,
          this.envelopeNodes.firstTop,
          (i - mid) / mid,
        );
      const second = i < mid ?
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondBot,
          this.envelopeNodes.secondMid,
          i / mid,
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondMid,
          this.envelopeNodes.secondTop,
          (i - mid) / mid,
        );
      const third = i < mid ?
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdBot,
          this.envelopeNodes.thirdMid,
          i / mid,
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdMid,
          this.envelopeNodes.thirdTop,
          (i - mid) / mid,
        );
      for (let j = 0; j < resolution; j++) {
        const t = j / resolution;
        let radius = t < 2 / 3 ? t < 1 / 3 ?
          THREE.MathUtils.lerp(first, second, t * 3):
          THREE.MathUtils.lerp(second, third, t * 3 - 1):
          THREE.MathUtils.lerp(third, first, t * 3 - 2);
        radius *= this.envelopeSize / 2;
        const theta = t *  2 * Math.PI;
        points.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          this.envelopePosition.y + this.envelopeSize * (0.12 + 0.21 * i),
          Math.sin(theta) * radius,
        ));
      }
    }
    // last point is at the top center of the envelope
    points.push(this.envelopePosition
      .clone()
      .add(new THREE.Vector3(0, this.envelopeSize, 0)),
    );
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(layers * resolution * 18);
    for (let i = 0; i < layers + 1; i++) {
      for (let j = 0; j < resolution; j++) {
        if (i === 0) {
          const index = j * 9;

          // triangle bot center
          positions[index + 0] = points[0].x;
          positions[index + 1] = points[0].y;
          positions[index + 2] = points[0].z;

          // triangle top right
          positions[index + 3] = points[1 + j].x;
          positions[index + 4] = points[1 + j].y;
          positions[index + 5] = points[1 + j].z;

          // triangle top left
          positions[index + 6] = points[1 + ((j + 1) % resolution)].x;
          positions[index + 7] = points[1 + ((j + 1) % resolution)].y;
          positions[index + 8] = points[1 + ((j + 1) % resolution)].z;
        } else if (i === layers) {
          const index = resolution * 9 + (i - 1) * resolution * 18 + j * 9;

          // triangle bot right
          positions[index + 0] = points[1 + (i - 1) * resolution + j].x;
          positions[index + 1] = points[1 + (i - 1) * resolution + j].y;
          positions[index + 2] = points[1 + (i - 1) * resolution + j].z;

          // triangle bot left
          positions[index + 3] = points[1 + (i - 1) * resolution + ((j + 1) % resolution)].x;
          positions[index + 4] = points[1 + (i - 1) * resolution + ((j + 1) % resolution)].y;
          positions[index + 5] = points[1 + (i - 1) * resolution + ((j + 1) % resolution)].z;

          // triangle top center
          positions[index + 6] = points[points.length - 1].x;
          positions[index + 7] = points[points.length - 1].y;
          positions[index + 8] = points[points.length - 1].z;
        } else {
          const index = resolution * 9 + (i - 1) * resolution * 18 + j * 18;

          const botLeft = points[1 + (i - 1) * resolution + ((j + 1) % resolution)];
          const botRight = points[1 + (i - 1) * resolution + j];
          const topLeft = points [1 + i * resolution + ((j + 1) % resolution)];
          const topRight = points[1 + i * resolution + j];

          // quad bot left
          positions[index + 0] = botLeft.x;
          positions[index + 1] = botLeft.y;
          positions[index + 2] = botLeft.z;
            
          // quad bot right
          positions[index + 3] = botRight.x;
          positions[index + 4] = botRight.y;
          positions[index + 5] = botRight.z;
            
          // quad top right
          positions[index + 6] = topRight.x;
          positions[index + 7] = topRight.y;
          positions[index + 8] = topRight.z;
            
          // quad top right
          positions[index +  9] = topRight.x;
          positions[index + 10] = topRight.y;
          positions[index + 11] = topRight.z;
            
          // quad top left
          positions[index + 12] = topLeft.x;
          positions[index + 13] = topLeft.y;
          positions[index + 14] = topLeft.z;
            
          // quad bot left
          positions[index + 15] = botLeft.x;
          positions[index + 16] = botLeft.y;
          positions[index + 17] = botLeft.z;
        }
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.MeshBasicMaterial({
      color: 0xeab2c2,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const envelopeMesh = new THREE.Mesh(geometry, material);
    parent.add(envelopeMesh);
  }

  private visualizeAttractorPoints(parent: THREE.Object3D, attractors: THREE.Vector3[]): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.numAttractors * 3);
    for (let i = 0; i < this.numAttractors; i++) {
      positions[i * 3 + 0] = attractors[i].x;
      positions[i * 3 + 1] = attractors[i].y;
      positions[i * 3 + 2] = attractors[i].z;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
    });
    const attractorPoints =  new THREE.Points(geometry, material);
    parent.add(attractorPoints);
  }

  private visualizeNodePoints(parent: THREE.Object3D, nodes: Node[]): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodes.length * 3);
    for (let i = 0; i < nodes.length; i++) {
      positions[i * 3 + 0] = nodes[i].position.x;
      positions[i * 3 + 1] = nodes[i].position.y;
      positions[i * 3 + 2] = nodes[i].position.z;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.2,
      sizeAttenuation: true,
      color: 0xbefefc,
    });
    const nodePoints = new THREE.Points(geometry, material);
    parent.add(nodePoints);
  }
}
