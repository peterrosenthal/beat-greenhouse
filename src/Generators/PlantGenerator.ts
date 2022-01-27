import * as THREE from 'three';
import GameManager from '../Managers/GameManager';

interface Node {
  position: THREE.Vector3,
  attractors: THREE.Vector3[],
}

export default class PlantGenerator {
  numAttractors: number;
  envelopeSize: number;
  envelopePosition: THREE.Vector3;
  numIterations: number;
  attractionRadius: number;
  growthSpeed: number;
  killDistance: number;

  visualizeAttractors: boolean;
  visualizeNodes: boolean;

  constructor() {
    this.numAttractors = 500;
    this.envelopeSize = 10;
    this.envelopePosition = new THREE.Vector3(0, 7, 0);
    this.numIterations = 30;
    this.attractionRadius = 5;
    this.growthSpeed = 0.1;
    this.killDistance = 0.8;

    this.visualizeAttractors = true;
    this.visualizeNodes = true;
  }

  generate(): void {
    // final plant object is a group that may include many different parts
    const plant = new THREE.Group();

    // generate attraction points
    let attractors: THREE.Vector3[] = [];
    for (let i = 0; i < this.numAttractors; i++) {
      attractors.push(new THREE.Vector3(
        (Math.random() - 0.5) * this.envelopeSize + this.envelopePosition.x,
        (Math.random() - 0.5) * this.envelopeSize + this.envelopePosition.y,
        (Math.random() - 0.5) * this.envelopeSize + this.envelopePosition.z,
      ));
    }

    // visualize the attraction points in a buffergeometry to verify it's working
    if (this.visualizeAttractors) {
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
      plant.add(attractorPoints);
    }

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

    // visualize the nodes in a buffergeometry to verify it is working
    if (this.visualizeNodes) {
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
      plant.add(nodePoints);
    }

    const scene = GameManager.getInstance().scene;
    scene.traverse(function(object) { scene.remove(object); });
    scene.add(plant);
  }
}
