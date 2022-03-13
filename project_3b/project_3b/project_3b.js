//#region Classes
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
    if (!isNaN(t1) && t1 >= 0 && ray.y0 + ray.direction.y * t1 > this.y && ray.y0 + ray.direction.y * t1 < this.y + this.height) {
      let [x, y, z] = this.getHitPosition(ray, t1);
      hits.push(new Hit(this, x, y, z, createVector(x - this.x, 0, z - this.z).normalize(), t1));
    }
    if (!isNaN(t2) && t2 >= 0 && ray.y0 + ray.direction.y * t2 > this.y && ray.y0 + ray.direction.y * t2 < this.y + this.height) {
      let [x, y, z] = this.getHitPosition(ray, t2);
      hits.push(new Hit(this, x, y, z, createVector(x - this.x, 0, z - this.z).normalize(), t2));
    }

    // Cap intersections
    let t3 = (this.y - ray.y0) / (ray.direction.y); // Bottom
    // Check if inside of cap
    if (!isNaN(t3) && t3 >= 0 && Math.pow(ray.x0 + ray.direction.x * t3 - this.x, 2) + Math.pow(ray.z0 + ray.direction.z * t3 - this.z, 2) <= Math.pow(this.radius, 2)) {
      let [x, y, z] = this.getHitPosition(ray, t3);
      hits.push(new Hit(this, x, y, z, createVector(0, -1, 0), t3));
    }

    let t4 = (this.y + this.height - ray.y0) / (ray.direction.y); // Top
    // Check if inside of cap
    if (!isNaN(t4) && t4 >= 0 && Math.pow(ray.x0 + ray.direction.x * t4 - this.x, 2) + Math.pow(ray.z0 + ray.direction.z * t4 - this.z, 2) <= Math.pow(this.radius, 2)) {
      let [x, y, z] = this.getHitPosition(ray, t4);
      hits.push(new Hit(this, x, y, z, createVector(0, 1, 0), t4));
    }

    return hits;
  }

  getHitPosition(ray, t) {
    return [ray.x0 + ray.direction.x * t, 
            ray.y0 + ray.direction.y * t, 
            ray.z0 + ray.direction.z * t];
  }

  getNearestHit(ray) {
    let hits = this.getHits(ray);

    let bestHit = null;
    let minT = Infinity;

    hits.forEach(
      hit => {
        if (hit != undefined && hit != null && hit.t < minT) {
          bestHit = hit;
          minT = hit.t;
        }
      }
    );
    return bestHit;
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
    let b = 2 * ((ray.x0 * ray.direction.x - ray.direction.x * this.x) + (ray.z0 * ray.direction.z - ray.direction.z * this.z));
    let c = Math.pow(ray.x0 - this.x, 2) + Math.pow(ray.z0 - this.z, 2) - Math.pow(this.radius, 2);
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
    let minT = Infinity;

    hits.forEach(
      hit => {
        if (hit != undefined && hit != null && hit.t >= 0 && hit.t < minT) {
          bestHit = hit;
          minT = hit.t;
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
      let [x, y, z] = this.getHitPosition(ray, t1);
      hits.push(new Hit(this, x, y, z, this.getSurfaceNormal(x, y, z), t1));
    }
    if (!isNaN(t2) && t2 >= 0) {
      let [x, y, z] = this.getHitPosition(ray, t2);
      hits.push(new Hit(this, x, y, z, this.getSurfaceNormal(x, y, z), t2));
    }

    return hits;
  }

  getHitPosition(ray, t) {
    return [ray.x0 + ray.direction.x * t, 
            ray.y0 + ray.direction.y * t, 
            ray.z0 + ray.direction.z * t];
  }
  getSurfaceNormal(x, y, z) {
    return createVector(x - this.x, y - this.y, z - this.z).normalize();
  }

  getQuadraticIntersectionTerms(ray) {
    let rayOrigin = createVector(ray.x0, ray.y0, ray.z0);
    let center = createVector(this.x, this.y, this.z);

    // Ray is unit vector, squared magnitude will always be 1
    let a = 1;

    // -2 * (-rayDirection * (rayOrigin - sphereCenter))
    let b = -2 * (p5.Vector.dot(p5.Vector.mult(ray.direction, -1), p5.Vector.sub(rayOrigin, center)));

    // (rayOrigin - center)^2 * rayDirection^2 - radius^2
    let c = Math.pow(p5.Vector.sub(rayOrigin, center).mag(), 2) * Math.pow(ray.direction.mag(), 2) - Math.pow(this.radius, 2);
    
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

  add(color2) {
    if (color2 != undefined) {
      this.r += color2.r;
      this.g += color2.g;
      this.b += color2.b;
      return this;
    }
  }
  mult(scale) {
    this.r *= scale;
    this.g *= scale;
    this.b *= scale;
    return this;
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
  constructor(sceneObject, x, y, z, surfaceNormal, t) {
    this.sceneObject = sceneObject;
    this.x = x;
    this.y = y;
    this.z = z;
    this.t = t;
    this.surfaceNormal = surfaceNormal;
  }
}
//#endregion

let sceneObjects = [];
let lights = []; // Store all lights here even though they inherit from SceneObject! Yes this is confusing! :)
let ambientLight = new AmbientLight(0, 0, 0);
let latestMaterial = null;
let backgroundColor = null;
let fov = 0;

//#region Scene Setup Functions
function reset_scene() {
  sceneObjects = [];
  lights = [];
  ambientLight = new AmbientLight(0, 0, 0);
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
  ambientLight = new AmbientLight(r, g, b);
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
//#endregion

function draw_scene() {
  noStroke();
  // For every pixel on the screen
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      let ray = createEyeRay(x, y);

      // Check ray against every sceneObject
      let hit = calculateRayHit(ray);

      let color = new Color(backgroundColor.r, backgroundColor.g, backgroundColor.b);
      if (hit != null) {
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

  // Assume ray always starts at origin
  return new Ray(0, 0, 0, createVector(xPrime, yPrime, z).normalize());
}

// Check the passed-in ray against every scene object and return the nearest hit
function calculateRayHit(ray) {
  let minT = Infinity;
  let hit = null;

  for (let i = 0; i < sceneObjects.length; i++) {
      let tempHit = sceneObjects[i].getNearestHit(ray);
      if (tempHit != null && tempHit.t < minT) {
        hit = tempHit;
        minT = tempHit.t;
      }
  }
  return hit;
}

//#region Shading Functions
// Check the passed-in ray against every scene object except the ignored one 
// and return true if an object is hit
function lightIsBlocked(ray, ignoredSceneObject) {
  for (let i = 0; i < sceneObjects.length; i++) {
    if (!(sceneObjects[i] === ignoredSceneObject)) {
      if (sceneObjects[i].getNearestHit(ray) != null) {
        return true;
      }
    }
  }
  return false;
}

const MAX_REFLECTION_RECUSION_LEVEL = 10;
const EPSILON = 0.0001;

function getShadedColor(hit) {
  let color = new Color(0, 0, 0);

  // Recursive Reflections
  if (hit.sceneObject.material.k_refl > 0) {
    color.add(recursiveShading(hit, 0));
  } else {
    color.add(diffuseAndAmbientShading(hit));
    color.add(specularShading(hit));
  }
  return color;
}

function recursiveShading(hit, reflectionRecursionLevel = 0) {
  let color = new Color(0, 0, 0);

  color.add(diffuseAndAmbientShading(hit));
  color.add(specularShading(hit));

  // Recursive Reflections
  if (hit.sceneObject.material.k_refl > 0 && reflectionRecursionLevel < MAX_REFLECTION_RECUSION_LEVEL) {
    let E = createVector(-hit.x, -hit.y, -hit.z).normalize(); // Vector to camera
    let N = hit.surfaceNormal; // Surface normal
  
    let R = reflect(E, N);

    // Calculate shifted starting point
    let startingPoint = createVector(hit.x, hit.y, hit.z);
    startingPoint.add(p5.Vector.mult(R, EPSILON));

    let reflectHit = calculateRayHit(new Ray(startingPoint.x, startingPoint.y, startingPoint.z, R));
    if (reflectHit != null) {
      color.add(recursiveShading(reflectHit, reflectionRecursionLevel + 1).mult(hit.sceneObject.material.k_refl));
    } else {
      color.add(new Color(backgroundColor.r, backgroundColor.g, backgroundColor.b));
    }
  }

  return color;
}

function diffuseAndAmbientShading(hit) {
  let color = new Color(0, 0, 0);

  let diffuseR = 0, diffuseG = 0, diffuseB = 0;
  for (let i = 0; i < lights.length; i++) {
    let directionToLight = createVector(lights[i].x - hit.x, lights[i].y - hit.y, lights[i].z - hit.z).normalize();
    let surfaceNormal = hit.surfaceNormal;

    let dotProduct = surfaceNormal.dot(directionToLight);
    if (dotProduct < 0) {
      dotProduct = 0;
    }

    // Cast shadows
    if (!lightIsBlocked(new Ray(hit.x, hit.y, hit.z, directionToLight), hit.sceneObject)) {
      diffuseR += lights[i].r * dotProduct;
      diffuseG += lights[i].g * dotProduct;
      diffuseB += lights[i].b * dotProduct;
    }
  }
  
  // Diffuse Color * (Ambient Amount + Diffuse Amount)
  color.r = hit.sceneObject.material.dr * (hit.sceneObject.material.ar * ambientLight.r + diffuseR);
  color.g = hit.sceneObject.material.dg * (hit.sceneObject.material.ag * ambientLight.g + diffuseG);
  color.b = hit.sceneObject.material.db * (hit.sceneObject.material.ab * ambientLight.b + diffuseB);

  return color;
}

function specularShading(hit) {
  let color = new Color(0, 0, 0);

  for (let i = 0; i < lights.length; i++) {
    let L = createVector(lights[i].x - hit.x, lights[i].y - hit.y, lights[i].z - hit.z).normalize(); // Vector to light source
    let N = hit.surfaceNormal; // Surface normal
    let E = createVector(-hit.x, -hit.y, -hit.z).normalize(); // Vector to camera

    let R = reflect(L, N);

    let specularFactor = Math.pow(E.dot(R), hit.sceneObject.material.pow / (4.0));
    if (specularFactor > 0) {
      color.r += hit.sceneObject.material.sr * lights[i].r * specularFactor;
      color.g += hit.sceneObject.material.sg * lights[i].g * specularFactor;
      color.b += hit.sceneObject.material.sb * lights[i].b * specularFactor;
    }
  }

  return color;
}

// Returns R, the reflection of L about N
function reflect(L, N) {
  N.normalize();

  let NdotL = p5.Vector.dot(N, L);
    if (NdotL < 0) {
     NdotL = 0
  }

  // Mirror of L about N
  let R = createVector(N.x * 2 * NdotL, N.y * 2 * NdotL, N.z * 2 * NdotL).sub(L);
  R.normalize();

  return R;
}
//#endregion