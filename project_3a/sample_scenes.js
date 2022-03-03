// This is the scene test code for the CS 3451 Ray Tracer Project.
//

// create the drawing canvas
function setup() {
  createCanvas(500, 500, P2D);
  one_long_cylinder();
}

// try out the different scenes
function keyPressed() {
  console.log ("key was pressed\n");
  reset_scene();
  switch(key) {
    case '1':  one_long_cylinder(); break;
    case '2':  one_short_cylinder(); break;
    case '3':  cylinder_face(); break;
    case '4':  five_cylinders(); break;
    case '5':  spheres(); break;
  }
}

// one long cylinder, so you don't see the ends
function one_long_cylinder() {
  
  console.log ("start of one_long_cylinder\n");
  
  set_background (0.5, 0.5, 0.9);
  
  set_fov (60.0);
  new_light (1, 1, 1, 7, 6, 10);
  
  // one cylinder
  new_material (0.9, 0.0, 0.0,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0, -4, -4,  1,  8);
  
  draw_scene();

  console.log ("end of one_long_cylinder\n");
}

function spheres() {
  
  console.log ("start of spheres\n");
  
  set_background (0.5, 0.5, 0.9);
  
  set_fov (60.0);
  new_light (1, 1, 1, 7, 6, 10);
  
  new_material (0.9, 0.0, 0.0,  0, 0, 0,  0, 0, 0,  1,  0);

  new_sphere(-1, -1, -4, 1);
  new_sphere(1.5, -1, -4, 1.25);
  
  draw_scene();

  console.log ("end of spheres\n");
}

// one cylinder
function one_short_cylinder() {
  
  console.log ("start of one_short_cylinder\n");
  
  set_background (0.5, 0.5, 0.9);
  
  set_fov (60.0);
  new_light (1, 1, 1, 7, 6, 10);
  
  // one cylinder
  new_material (0.9, 0.0, 0.0,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0, -1, -4,  1,  2);
  
  draw_scene();

  console.log ("end of one_short_cylinder\n");
}

// cylinders that make a face
function cylinder_face() {
  
  console.log ("start of cylinder_face\n");
  
  set_background (0.95, 0.95, 0.95);
  
  set_fov (60.0);
  
  new_light (1, 1, 1, 7, 7, 10);
  
  // cylinders
  
  new_material (0.7, 0.7, 0.9,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0, -1, -4,  1,  2);
  
  new_material (0.4, 0.4, 0.9,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0, -0.2, -3,  0.2,  0.4);
  
  new_material (0.4, 0.9, 0.4,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (-0.3, 0.3, -3, 0.15, 0.25);
  
  new_material (0.4, 0.9, 0.4,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder ( 0.3, 0.3, -3, 0.15, 0.25);
  
  new_material (0.9, 0.4, 0.6,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0, -0.6, -3,  0.6,  0.2);
  
  draw_scene();

  console.log ("end of cylinder_face\n");
}

// five cylinders in a pattern
function five_cylinders() {
  
  console.log ("start of five_cylinders\n");
  
  set_background (0.95, 0.95, 0.95);
  
  set_fov (60.0);
  
  new_light (1, 1, 1, 7, 7, 10);
  
  // cylinders
  let rad = 0.5;
  let h = 0.2;
  
  new_material (0.0, 0.0, 0.9,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (-1.1, -1.5, -4,  rad, h);
  
  new_material (0.1, 0.1, 0.1,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0, -1.5, -4,  rad, h);
  
  new_material (0.9, 0.0, 0.0,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (1.1, -1.5, -4,  rad, h);
  
  new_material (0.9, 0.9, 0.0,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (-0.55, -1.5, -3.5,  rad, h);
  
  new_material (0.0, 0.9, 0.0,  0, 0, 0,  0, 0, 0,  1,  0);
  new_cylinder (0.55, -1.5, -3.5,  rad, h);
  
  draw_scene();

  console.log ("end of five_cylinders\n");
}

// unused draw function
function draw() {
}
