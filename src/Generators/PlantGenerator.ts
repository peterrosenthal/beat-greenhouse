import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';
import GameManager from '../Managers/GameManager';

interface Node {
  parent?: Node,
  children: Node[],
  position: THREE.Vector3,
  attractors: THREE.Vector3[],
  radius: number,
}

export default class PlantGenerator {
  // simplex generator instance
  simplex: SimplexNoise;

  // envelope
  envelopeSize: number;
  envelopePosition: THREE.Vector3;
  envelopeNodes: Record<string, number>;

  // attractors
  noiseOffset: THREE.Vector3;
  noiseScale: number;
  noiseThreshold: number;
  noiseThresholdSkewLocation: number;
  noiseThresholdSkewAmount: number;
  attractionRadius: number;
  killDistance: number;

  // growth
  numIterations: number;
  growthSpeed: number;
  thicknessGrowthFactor: number;
  slowThicknessGrowthFactor: number;
  thicknessCombinationFactor: number;

  // what to visualize
  visualizeEnvelope: boolean;
  visualizeAttractors: boolean;
  visualizeNodes: boolean;
  visualizeStems: boolean;

  constructor() {
    // initialize the simplex noise instance
    this.simplex = new SimplexNoise('Beat Greenhouse');

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
    this.noiseOffset = new THREE.Vector3(0, 0, 0);
    this.noiseScale = 5;
    this.noiseThreshold = 0.9;
    this.noiseThresholdSkewLocation = 0.5;
    this.noiseThresholdSkewAmount = 0.5;
    this.attractionRadius = 5;
    this.killDistance = 0.8;

    // growth
    this.numIterations = 80;
    this.growthSpeed = 0.1;
    this.thicknessGrowthFactor = 0.001;
    this.slowThicknessGrowthFactor = 0.0001;
    this.thicknessCombinationFactor = 2.5;

    // what to visualize
    this.visualizeEnvelope = false;
    this.visualizeAttractors = false;
    this.visualizeNodes = false;
    this.visualizeStems = true;
  }

  generate(): void {
    // final plant object is a group that may include many different parts
    const plant = new THREE.Group();
    plant.name = 'plant';

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

    // visualize the nodes in a group of cylinder geometry meshes based on their radius
    if (this.visualizeStems) {
      this.visualizeNodeCylinders(plant, nodes);
    }

    const scene = GameManager.getInstance().scene;
    scene.traverse(function(object) { if (object.name === 'plant') scene.remove(object); });
    scene.add(plant);
  }

  private generateInitialAttractors(): THREE.Vector3[] {
    const attractors: THREE.Vector3[] = [];

    // these "resolutions" may or may not become externally controlled factors
    // or they might become based upon other externally controlled factors
    // but for now they are just internal constants
    const resolution = {
      horizontal: 8000,
      vertical: 120,
    };

    // at each vertical step, send out a spiral of points to check if they
    // land on a peak location of the noise function
    for (let i = 0; i < resolution.vertical; i++) {
      // get the height of the layer (starting as a number 0-1, we will scale it later)
      let height = i / resolution.vertical;

      // "smootherstep" lerp between the 3 vertical layers of envelope shape nodes
      // so that we can check if the point is within the envelope
      const first = height < 0.96 ? height < 0.54 ? height < 0.12 ?
        THREE.MathUtils.lerp(
          0,
          this.envelopeNodes.firstBot,
          THREE.MathUtils.smootherstep(height, 0, 0.12),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstBot,
          this.envelopeNodes.firstMid,
          THREE.MathUtils.smootherstep(height, 0.12, 0.54),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstMid,
          this.envelopeNodes.firstTop,
          THREE.MathUtils.smootherstep(height, 0.54, 0.96),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstTop,
          0,
          THREE.MathUtils.smootherstep(height, 0.96, 1),
        );
      const second = height < 0.96 ? height < 0.54 ? height < 0.12 ?
        THREE.MathUtils.lerp(
          0,
          this.envelopeNodes.secondBot,
          THREE.MathUtils.smootherstep(height, 0, 0.12),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondBot,
          this.envelopeNodes.secondMid,
          THREE.MathUtils.smootherstep(height, 0.12, 0.54),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondMid,
          this.envelopeNodes.secondTop,
          THREE.MathUtils.smootherstep(height, 0.54, 0.96),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondTop,
          0,
          THREE.MathUtils.smootherstep(height, 0.96, 1),
        );
      const third = height < 0.96 ? height < 0.54 ? height < 0.12 ?
        THREE.MathUtils.lerp(
          0,
          this.envelopeNodes.thirdBot,
          THREE.MathUtils.smootherstep(height, 0, 0.12),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdBot,
          this.envelopeNodes.thirdMid,
          THREE.MathUtils.smootherstep(height, 0.12, 0.54),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdMid,
          this.envelopeNodes.thirdTop,
          THREE.MathUtils.smootherstep(height, 0.54, 0.96),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdTop,
          0,
          THREE.MathUtils.smootherstep(height, 0.96, 1),
        );
      
      // scale the height value by the envelope size
      height *= this.envelopeSize;

      // perform a spiral search
      const PHI = (1 + Math.sqrt(5)) / 2;
      for (
        let theta = 0, radius = 0;
        radius < this.envelopeSize / 2;
        theta = (theta + 2 * Math.PI * PHI) % (2 * Math.PI),
        radius += this.envelopeSize / ((radius > 0.2 ? radius : 0.1) * resolution.horizontal)
      ) {
        let maxRadius = theta < 4 * Math.PI / 3 ? theta < 2 * Math.PI / 3 ?
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
          );
        maxRadius *= this.envelopeSize / 2;
        if (radius < maxRadius) {
          const point = new THREE.Vector3(
            this.envelopePosition.x + Math.cos(theta) * radius,
            this.envelopePosition.y + height,
            this.envelopePosition.z + Math.sin(theta) * radius,
          );
          const percentRad = radius / maxRadius;
          /* eslint-disable indent */
          /* eslint-disable max-len */
          const thresholdSkew = this.noiseThresholdSkewAmount
            * Math.min(this.noiseThreshold - 0.6, 0.99 - this.noiseThreshold)
            * (this.noiseThresholdSkewLocation < 1 ? this.noiseThresholdSkewLocation < 0.9 ? this.noiseThresholdSkewLocation < 0.1 ? this.noiseThresholdSkewLocation === 0 ?
              THREE.MathUtils.lerp(1, -1, percentRad):
              (percentRad < this.noiseThresholdSkewLocation ?
                THREE.MathUtils.lerp(0, 1, percentRad / this.noiseThresholdSkewLocation):
                THREE.MathUtils.lerp(1, -1, (percentRad - this.noiseThresholdSkewLocation) / (1 - this.noiseThresholdSkewLocation))):
              (percentRad < this.noiseThresholdSkewLocation ?
                THREE.MathUtils.lerp(-1, 1, percentRad / this.noiseThresholdSkewLocation):
                THREE.MathUtils.lerp(1, -1, (percentRad - this.noiseThresholdSkewLocation) / (1 - this.noiseThresholdSkewLocation))):
              (percentRad < this.noiseThresholdSkewLocation ?
                THREE.MathUtils.lerp(-1, 1, percentRad / this.noiseThresholdSkewLocation):
                THREE.MathUtils.lerp(1, 0, (percentRad - this.noiseThresholdSkewLocation) / (1 - this.noiseThresholdSkewLocation))):
              THREE.MathUtils.lerp(-1, 1, percentRad));
          /* eslint-enable indent */
          /* eslint-enable max-len */
          const threshold = this.noiseThreshold - thresholdSkew;
          const noisePoint = point
            .clone()
            .multiplyScalar(this.noiseScale)
            .add(this.noiseOffset);
          const noise = this.simplex.noise3D(noisePoint.x, noisePoint.y, noisePoint.z);
          if (noise > threshold) {
            attractors.push(point);
          }
        }
      }
    }
    return attractors;
  }

  private generateNodes(attractors: THREE.Vector3[]): Node[] {
    // first node of the stem + branches is at local point (0,0,0)
    const nodes: Node[] = [];
    const root: Node = {
      parent: undefined,
      children: [],
      position: new THREE.Vector3(),
      attractors: [],
      radius: 0,
    };
    nodes.push(root);
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
        centerOfMass.divideScalar(attractors.length);
        const parent = nodes[nodes.length - 1];
        const child: Node = {
          parent: parent,
          children: [],
          position: parent.position.clone().add(
            centerOfMass
              .clone()
              .sub(parent.position)
              .normalize()
              .multiplyScalar(this.growthSpeed)),
          attractors: [],
          radius: 0,
        };
        parent.children.push(child);
        nodes.push(child);
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
            const child: Node = {
              parent: node,
              children: [],
              position: node.position.clone().add(
                centerOfMass
                  .clone()
                  .sub(node.position)
                  .normalize()
                  .multiplyScalar(this.growthSpeed)),
              attractors: [],
              radius: 0,
            };
            node.children.push(child);
            nodesToAdd.push(child);
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

    // calculate the radius of the stem/branches at each node based on how
    // many (recursively) children nodes they have on the tree.
    for (const node of nodes) {
      if (node.children.length === 0) {
        let growth = this.thicknessGrowthFactor;
        let radiusToAdd = 0;
        let safety = 0;
        let current = node;
        let previous: Node | undefined;
        while (current.parent !== undefined) {
          if (safety > this.numIterations) {
            console.error('tree formed a loop somehow!');
            break;
          }

          if (current.radius !== 0 && growth !== this.slowThicknessGrowthFactor) {
            growth = this.slowThicknessGrowthFactor;
          }

          if (current.children.length > 1 && previous !== undefined) {
            let newRadius = 0;
            for (const child of current.children) {
              newRadius += Math.pow(child.radius, this.thicknessCombinationFactor);
            }
            newRadius = Math.pow(newRadius, 1 / this.thicknessCombinationFactor);
            radiusToAdd = newRadius - current.radius;
            current.radius = newRadius;
          } else {
            current.radius += radiusToAdd;
          }
          
          radiusToAdd += growth;
          safety++;
          previous = current;
          current = current.parent;
        }
      }
    }

    return nodes;
  }

  private visualizeEnvelopeMesh(parent: THREE.Object3D): void {
    const resolution = 48;
    const layers = 20;
    const points: THREE.Vector3[] = [];
    // first point at the bottom center of the envelope
    points.push(this.envelopePosition);
    // add 5 "layers" of 12 points each between the top and the bottom
    for (let i = 0; i < layers; i++) {
      const mid = Math.floor(layers  / 2);
      const first = i < mid ?
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstBot,
          this.envelopeNodes.firstMid,
          THREE.MathUtils.smootherstep(i, 0, mid),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.firstMid,
          this.envelopeNodes.firstTop,
          THREE.MathUtils.smootherstep(i, mid, layers),
        );
      const second = i < mid ?
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondBot,
          this.envelopeNodes.secondMid,
          THREE.MathUtils.smootherstep(i, 0, mid),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.secondMid,
          this.envelopeNodes.secondTop,
          THREE.MathUtils.smootherstep(i, mid, layers),
        );
      const third = i < mid ?
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdBot,
          this.envelopeNodes.thirdMid,
          THREE.MathUtils.smootherstep(i, 0, mid),
        ):
        THREE.MathUtils.lerp(
          this.envelopeNodes.thirdMid,
          this.envelopeNodes.thirdTop,
          THREE.MathUtils.smootherstep(i, mid, layers),
        );
      for (let j = 0; j < resolution; j++) {
        const t = j / resolution;
        let radius = t < 2 / 3 ? t < 1 / 3 ?
          THREE.MathUtils.lerp(first, second, THREE.MathUtils.smootherstep(t, 0, 1 / 3)):
          THREE.MathUtils.lerp(second, third, THREE.MathUtils.smootherstep(t, 1 / 3, 2 / 3)):
          THREE.MathUtils.lerp(third, first, THREE.MathUtils.smootherstep(t, 2 / 3, 1));
        radius *= this.envelopeSize / 2;
        const theta = t *  2 * Math.PI;
        points.push(new THREE.Vector3(
          Math.cos(theta) * radius,
          this.envelopePosition.y + this.envelopeSize * (0.1 + 0.046 * i),
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
    const positions = new Float32Array(attractors.length * 3);
    for (let i = 0; i < attractors.length; i++) {
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

  private visualizeNodeCylinders(parent: THREE.Object3D, nodes: Node[]): void {
    const cylinders = new THREE.Group();
    parent.add(cylinders);

    const material = new THREE.MeshStandardMaterial({
      color: 0x6c441a,
      roughness: 0.8,
    });

    for (const node of nodes) {
      for (const child of node.children) {
        const geometry = new THREE.CylinderGeometry(
          child.radius,
          node.radius,
          this.growthSpeed,
          64,
        );
        const cylinder = new THREE.Mesh(geometry, material);
        const direction3d = child.position
          .clone()
          .sub(node.position)
          .normalize();
        const direction2d = new THREE.Vector3(direction3d.x, 0, direction3d.z).normalize();
        const position = node.position
          .clone()
          .add(child.position)
          .divideScalar(2);
        cylinder.rotateY(
          (direction2d.z <= 0 ? 1 : -1) *
          direction2d.angleTo(new THREE.Vector3(1, 0, 0)) +
          Math.PI / 2);
        cylinder.rotateX(direction3d.angleTo(new THREE.Vector3(0, 1, 0)));
        cylinder.position.copy(position);
        cylinders.add(cylinder);
      }
    }
  }
}
