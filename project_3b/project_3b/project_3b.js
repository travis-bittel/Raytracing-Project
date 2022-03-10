class SceneObject {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Cylinder extends SceneObject {
  constructor(x, y, z, radius, height, material) {
    super(x, y, z);
    this.radius = radius;
    this.height = height;
    this.material = material;
  }

  getHits(ray) {
    let hits = [];

    // Quadratic Formula
    let [a, b, c] = this.getQuadraticIntersectionTerms(ray);

    let t1 = ((-b) + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    let t2 = ((-b) - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    if (!isNaN(t1) && t1 >= 0 && ray.direction.y * t1 > this.y && ray.direction.y * t1 < this.y + this.height) {
      hits.push(new Hit(this, ray.direction.x * t1, ray.direction.y * t1, ray.direction.z * t1, 
          createVector(ray.direction.x * t1 - this.x, 0, ray.direction.z * t1 - this.z).normalize()));
    }
    if (!isNaN(t2) && t2 >= 0 && ray.direction.y * t2 > this.y && ray.direction.y * t2 < this.y + this.height) {
      hits.push(new Hit(this, ray.direction.x * t2, ray.direction.y * t2, ray.direction.z * t2, 
        createVector(ray.direction.x * t2 - this.x, 0, ray.direction.z * t2 - this.z).normalize()));
    }

    // Cap intersections
    let t3 = this.y / ray.direction.y; // Bottom
    // Check if inside of cap
    if (!isNaN(t3) && t3 >= 0 && Math.pow(t3 * ray.direction.x - this.x, 2) + Math.pow(t3 * ray.direction.z - this.z, 2) <= Math.pow(this.radius, 2)) {
      hits.push(new Hit(this, ray.direction.x * t3, ray.direction.y * t3, ray.direction.z * t3, createVector(0, -1, 0)));
    }

    let t4 = (this.y + this.height) / ray.direction.y; // Top
    // Check if inside of cap
    if (!isNaN(t4) && t4 >= 0 && Math.pow(t4 * ray.direction.x - this.x, 2) + Math.pow(t4 * ray.direction.z - this.z, 2) <= Math.pow(this.radius, 2)) {
      hits.push(new Hit(this, ray.direction.x * t4, ray.direction.y * t4, ray.direction.z * t4, createVector(0, 1, 0)));
    }

    return hits;
  }

  getNearestHit(ray) {
    let hits = this.getHits(ray);

    let bestHit = null;
    let maxZ = -Infinity;

    hits.forEach(
      hit => {
        if (hit != undefined && hit != null && hit.z > maxZ) {
          bestHit = hit;
          maxZ = hit.z;
        }
      }
    );

    return bestHit;

  }

  getTValues(ray) {
    let [a, b, c] = this.getQuadraticIntersectionTerms(ray);

    let tValues = [];

    // Quadratic Formula
    // let t1 = ((-b) + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    // let t2 = ((-b) - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    // if (!isNaN(t1) && t1 >= 0) {
    //   tValues.push(t1);
    // }
    // if (!isNaN(t2) && t2 >= 0) {
    //   tValues.push(t2);
    // }

    // Cap intersections
    let t3 = this.y / ray.direction.y; // Bottom
    // Check if inside of cap
    if (!isNaN(t3) && t3 >= 0 && Math.pow(t3 * ray.direction.x - this.x, 2) + Math.pow(t3 * ray.direction.z - this.z, 2) <= Math.pow(this.radius, 2)) {
      tValues.push(t3);
    }

    let t4 = (this.y + this.height) / ray.direction.y; // Top
    // Check if inside of cap
    if (!isNaN(t4) && t4 >= 0 && Math.pow(t4 * ray.direction.x - this.x, 2) + Math.pow(t4 * ray.direction.z - this.z, 2) <= Math.pow(this.radius, 2)) {
      tValues.push(t4);
    }

    return tValues;
  }

  getSmallestTValue(ray) {
    let tValues = this.getTValues(ray);

    let bestT = null;
    let maxZ = -Infinity;

    tValues.forEach(
      t => {
        let tempHit = calculateIntersection(t, ray, this);
        if (tempHit != undefined && tempHit != null && tempHit.z > maxZ) {
          bestT = t;
          maxZ = tempHit.z;
        }
      }
    );

    return bestT;
  }
  
  getQuadraticIntersectionTerms(ray) {
    let a = Math.pow(ray.direction.x, 2) + Math.pow(ray.direction.z, 2); 
    let b = -2 * ray.direction.x * this.x - (2 * ray.direction.z * this.z);
    let c = Math.pow(this.x, 2) + Math.pow(this.z, 2) - Math.pow(this.radius, 2);
    return [a, b, c];
  }
}

class Sphere extends SceneObject {
  constructor(x, y, z, radius, material) {
    super(x, y, z);
    this.radius = radius;
    this.material = material;
  }

  getNearestHit(ray) {
    let hits = this.getHits(ray);

    let bestHit = null;
    let maxZ = -Infinity;

    hits.forEach(
      hit => {
        if (hit != undefined && hit != null && hit.z > maxZ) {
          bestHit = hit;
          maxZ = hit.z;
        }
      }
    );

    return bestHit;

  }

  getHits(ray) {
    let hits = [];

    let [a, b, c] = this.getQuadraticIntersectionTerms(ray);

    // Quadratic Formula
    let t1 = ((-b) + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    let t2 = ((-b) - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);

    if (!isNaN(t1) && t1 >= 0) {
      hits.push(new Hit(this, ray.direction.x * t1, ray.direction.y * t1, ray.direction.z * t1, 
          createVector(ray.direction.x * t1 - this.x, ray.direction.y * t1 - this.y, ray.direction.z * t1 - this.z).normalize()));
    }
    if (!isNaN(t2) && t2 >= 0) {
      hits.push(new Hit(this, ray.direction.x * t2, ray.direction.y * t2, ray.direction.z * t2, 
        createVector(ray.direction.x * t2 - this.x, ray.direction.y * t1 - this.y, ray.direction.z * t2 - this.z).normalize()));
    }

    return hits;
  }

  getTValues(ray) {
    let [a, b, c] = this.getQuadraticIntersectionTerms(ray);

    // Quadratic Formula
    let t1 = ((-b) + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
    let t2 = ((-b) - Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);

    return [t1, t2];
  }

  getQuadraticIntersectionTerms(ray) {
    let a = 1; // Ray is unit vector, squared magnitude will always be 1
    let b = -2 * (ray.direction.x * this.x + ray.direction.y * this.y + ray.direction.z * this.z);
    let c = Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2) - Math.pow(this.radius, 2);
    return [a, b, c];
  }
}

class Light extends SceneObject {
  constructor(r, g, b, x, y, z) {
    super(x, y, z);
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class AmbientLight {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class Material {
  constructor(dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl) {
    this.dr = dr;
    this.dg = dg;
    this.db = db;
    this.ar = ar;
    this.ag = ag;
    this.ab = ab;
    this.sr = sr;
    this.sg = sg;
    this.sb = sb;
    this.pow = pow;
    this.k_refl = k_refl;
  }
  static copyOf(material) {
    let mat = new Material(material.dr, material.dg, material.db, material.ar, material.ag, 
      material.ab, material.sr, material.sg, material.sb, material.pow, material.k_refl);
    return mat;
  }
}

class Color {
  constructor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

class Ray {
  constructor(x0, y0, z0, direction) {
    this.x0 = x0;
    this.y0 = y0;
    this.z0 = z0;
    this.direction = direction;
  }
}

class Hit {
  constructor(sceneObject, x, y, z, surfaceNormal) {
    this.sceneObject = sceneObject;
    this.x = x;
    this.y = y;
    this.z = z;
    this.surfaceNormal = surfaceNormal;
  }
}

let sceneObjects = [];
let lights = []; // Store all lights here even though they inherit from SceneObject! Yes this is confusing! :)
let ambientLights = [];
let latestMaterial = null;
let backgroundColor = null;
let fov = 0;

function reset_scene() {
  sceneObjects = [];
  lights = [];
  ambientLights = [];
  latestMaterial = null;
  backgroundColor = null;
  fov = 0;
}

function set_background (r, g, b) {
  backgroundColor = new Color(r, g, b);
}

function set_fov (angle) {
  fov = angle;
}

function new_light (r, g, b, x, y, z) {
  lights.push(new Light(r, g, b, x, y, z));
}

function ambient_light (r, g, b) {
  ambientLights.push(new AmbientLight(r, g, b));
}

function new_material (dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl) {
  latestMaterial = new Material(dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl);
}

function new_cylinder (x, y, z, radius, h) {
  sceneObjects.push(new Cylinder(x, y, z, radius, h, Material.copyOf(latestMaterial)));
}

function new_sphere(x, y, z, radius) {
  sceneObjects.push(new Sphere(x, y, z, radius, Material.copyOf(latestMaterial)));
}

function draw_scene() {
  noStroke();
  // go through all the pixels in the image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      let ray = createEyeRay(x, y);

      // Check ray against every cylinder
      let hit = calculateRayHit(ray);

      // Set the pixel color to the shaded color of the ray
      if (hit == null) {
        color.r = backgroundColor.r;
        color.g = backgroundColor.g;
        color.b = backgroundColor.b;
      } else {
        color = getShadedColor(hit);
      }

      fill (color.r * 255, color.g * 255, color.b * 255);

      // Fill pixel with shaded color
      rect (x, y, 1, 1);
    }
  }
}

function createEyeRay(x, y) {
  let k = Math.tan((fov * Math.PI / 180) / 2); 

  let yPrime = (y - (height / 2)) * (2 * k / (height));
  yPrime *= -1;
  let xPrime = (x - (width / 2)) * (2 * k / width);
  let z = -1;

  return new Ray(0, 0, 0, createVector(xPrime, yPrime, z).normalize());
}

function calculateRayHit(ray) {
  // Check ray against every scene object
  let maxZ = -Infinity;
  let hit = null;

  for (let i = 0; i < sceneObjects.length; i++) {
    let tempHit = sceneObjects[i].getNearestHit(ray);
    if (tempHit != null && tempHit.z > maxZ) {
      hit = tempHit;
      maxZ = tempHit.z;
    }
  }
  return hit;
}

function getShadedColor(hit) {
  let color = new Color(0, 0, 0);
  for (let i = 0; i < lights.length; i++) {
    let direction = createVector(lights[i].x - hit.x, lights[i].y - hit.y, lights[i].z - hit.z).normalize();
    let surfaceNormal = hit.surfaceNormal;

    let dotProduct = surfaceNormal.dot(direction);
    if (dotProduct < 0) {
      dotProduct = 0;
    }

    color.r += hit.sceneObject.material.dr * lights[i].r * dotProduct;
    color.g += hit.sceneObject.material.dg * lights[i].g * dotProduct;
    color.b += hit.sceneObject.material.db * lights[i].b * dotProduct;
  }
  for (let i = 0; i < ambientLights.length; i++) {
    color.r += hit.sceneObject.material.ar * ambientLights[i].r;
    color.g += hit.sceneObject.material.ag * ambientLights[i].g;
    color.b += hit.sceneObject.material.ab * ambientLights[i].b;
  }

  return color;
}
