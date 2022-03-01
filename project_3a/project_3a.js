// Travis Bittel

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
}

class Light extends SceneObject {
  constructor(r, g, b, x, y, z) {
    super(x, y, z);
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
  constructor(sceneObject, x, y, z) {
    this.sceneObject = sceneObject;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

let sceneObjects = [];
let lights = []; // Store all lights here even though they inherit from SceneObject! Yes this is confusing! :)
let latestMaterial = null;
let backgroundColor = null;
let fov = 0;

//these are the routines that you should write for the project
function reset_scene() {
  sceneObjects = [];
  lights = [];
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

function new_material (dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl) {
  latestMaterial = new Material(dr, dg, db, ar, ag, ab, sr, sg, sb, pow, k_refl);
}

function new_cylinder (x, y, z, radius, h) {
  sceneObjects.push(new Cylinder(x, y, z, radius, h, Material.copyOf(latestMaterial)));
}

function draw_scene() {
  noStroke();
  // go through all the pixels in the image
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      // add your ray creation and scene intersection code here
      let k = Math.tan((fov * Math.PI / 180) / 2); 

      let yPrime = (y - (height / 2)) * (2 * k / (height * 2)); // Why height * 2??
      yPrime *= -1; // Flip it?
      let xPrime = (x - (width / 2)) * (2 * k / width);
      let z = -1;

      let ray = new Ray(0, 0, 0, createVector(xPrime, yPrime, z).normalize());

      // Check ray against every cylinder
      let hit = calculateRayHit(ray);

      // set the pixel color to the shaded color of the ray
      if (hit == null) {
        color.r = backgroundColor.r;
        color.g = backgroundColor.g;
        color.b = backgroundColor.b;
      } else {
        color = getShadedColor(hit);
      }

      fill (color.r * 255, color.g * 255, color.b * 255);

      // draw a little rectangle to fill the pixel
      rect (x, y, 1, 1);
      
    }
  }

  test(new Hit(new Cylinder(0, 0, 0, 1, 2, latestMaterial), 1, 1, 1));
}

function test(hit) {
  let color = new Color();
  for (let i = 0; i < lights.length; i++) {
    let direction = createVector(lights[i].x - hit.x, lights[i].y - hit.y, lights[i].z - hit.z);
    // Courtesy of: https://stackoverflow.com/questions/36266357/how-can-i-compute-normal-on-the-surface-of-a-cylinder
    let surfaceNormal = createVector(hit.x - hit.sceneObject.x, 0, hit.z - hit.sceneObject.z);

    let dotProduct = surfaceNormal.dot(direction) / surfaceNormal.mag() / direction.mag();
    if (dotProduct < 0) {
      dotProduct = 0;
    }
    color.r = hit.sceneObject.material.dr * lights[i].r * dotProduct;
    color.g = hit.sceneObject.material.dg * dotProduct;
    color.b = hit.sceneObject.material.db * dotProduct;

    console.log(`For Hit Point (${hit.x}, ${hit.y}, ${hit.z}): \nSurface Normal: ${surfaceNormal} \n Direction: ${direction} \nDot Product: ${dotProduct} \nRed: ${color.r}`);
  }

  return color;
}

function calculateRayHit(ray) {
  // Check ray against every cylinder
  let maxZ = -Infinity;
  let hit = null;
  for (let i = 0; i < sceneObjects.length; i++) {
    // Plug our ray equation into the implicit cylinder equation and turn it into a quadratic: ax^2 + bx + c = 0
    let a = Math.pow(ray.direction.x, 2) + Math.pow(ray.direction.z, 2);
    let b = -2 * ray.direction.x * sceneObjects[i].x - (2 * ray.direction.z * sceneObjects[i].z);
    let c = Math.pow(sceneObjects[i].x, 2) + Math.pow(sceneObjects[i].z, 2) - Math.pow(sceneObjects[i].radius, 2);

    // Quadratic Formula
    let t1 = -b + Math.sqrt(Math.pow(b, 2) - (4 * a * c));
    let t2 = -b - Math.sqrt(Math.pow(b, 2) - (4 * a * c));

    // Check both t-values and use them if the z is greater than our current
    let tempHit = calculateIntersection(t1, ray, sceneObjects[i]);
    if (tempHit != undefined && tempHit.z > maxZ) {
      hit = tempHit;
      maxZ = tempHit.z;
    }

    // 0, -4, -3

    tempHit = calculateIntersection(t2, ray, sceneObjects[i]);
    if (tempHit != undefined && tempHit.z > maxZ) {
      hit = tempHit;
      maxZ = tempHit.z;
    }
  }

  // if (hit != null) {
  //   console.log(`${hit.x}, ${hit.y}, ${hit.z}`);
  // }

  return hit;
}

function calculateIntersection(t, ray, sceneObject) {
  let x = ray.direction.x * t;
  let y = ray.direction.y * t;
  let z = ray.direction.z * t;

  if (t > 0 && y < sceneObject.y + sceneObject.height && y > sceneObject.y) {
    return new Hit(sceneObject, x, y, z);
  }
}

function getShadedColor(hit) {
  let color = new Color();
  for (let i = 0; i < lights.length; i++) {
    let direction = createVector(lights[i].x - hit.x, lights[i].y - hit.y, lights[i].z - hit.z).normalize();
    // Courtesy of: https://stackoverflow.com/questions/36266357/how-can-i-compute-normal-on-the-surface-of-a-cylinder
    let surfaceNormal = createVector(hit.x - hit.sceneObject.x, 0, hit.z - hit.sceneObject.z).normalize();
    
    let dotProduct = surfaceNormal.dot(direction);
    if (dotProduct < 0) {
      dotProduct = 0;
    }

    color.r = hit.sceneObject.material.dr * lights[i].r * dotProduct;
    color.g = hit.sceneObject.material.dg * lights[i].g * dotProduct;
    color.b = hit.sceneObject.material.db * lights[i].b * dotProduct;
  }
  
  return color;
}