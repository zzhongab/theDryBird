//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0,
};

// THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer, container;

var oldTime = new Date().getTime();
var newTime = new Date().getTime();
var deltaTime = deltaTime = newTime-oldTime;

var surfaceVerts  = [];


//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

var
    vars      = [],
    running     = true,

    health  = 100,
    gameOver  = false;
    raindrops   = [],

    // constants
    DAMPEN      = .9,
    AGGRESSION    = 400,
    DEPTH       = 500,
    NEAR      = 1,
    FAR       = 10000,
    X_RESOLUTION  = 400,
    Y_RESOLUTION  = 200,
    SURFACE_WIDTH =4000,
    SURFACE_HEIGHT  = 2000,
    DROP_RATE   = 200,
    fin       = true;
    RAIN_DROP_NUM   = 7;


function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
    );
  // scene.fog = new THREE.Fog(0xBFD2DE, 80,950);
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 75;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', handleWindowResize, false);
}

// HANDLE SCREEN EVENTS

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}


// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {
  ambientLight = new THREE.AmbientLight( 0x202020 ); // soft white light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  scene.add( ambientLight );
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}


var Bird = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "bird";

  // Create the cabin
  var geomCockpit = new THREE.BoxGeometry(60,40,50,1,1,1);
  var matCockpit = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

  geomCockpit.vertices[4].y-=10;
  geomCockpit.vertices[4].z+=20;
  geomCockpit.vertices[5].y-=10;
  geomCockpit.vertices[5].z-=20;
  geomCockpit.vertices[6].y+=30;
  geomCockpit.vertices[6].z+=20;
  geomCockpit.vertices[7].y+=30;
  geomCockpit.vertices[7].z-=20;


  var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);

  // Create Neck
  var geomNeck = new THREE.BoxGeometry(40,40,50,1,1,1);
  var matNeck = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

  geomNeck.vertices[0].y+=20;
  geomNeck.vertices[0].z-=10;
  geomNeck.vertices[1].y+=20;
  geomNeck.vertices[1].z+=10;
  geomNeck.vertices[2].y+=45;
  geomNeck.vertices[2].z-=10;
  geomNeck.vertices[3].y+=45;
  geomNeck.vertices[3].z+=10;

  var neck = new THREE.Mesh(geomNeck, matNeck);
  neck.position.x = 50;
  neck.castShadow = true;
  neck.receiveShadow = true;
  this.mesh.add(neck);

  // Create Tailplane
  var geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
  var matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
  var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-35,15,0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
	this.mesh.add(tailPlane);

  // Create Right Wing
  var geomRightWing = new THREE.BoxGeometry(40,8,150,1,1,1);
  var matRightWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

  geomRightWing.vertices[1].z+=75;
  geomRightWing.vertices[3].z+=75;
  geomRightWing.vertices[4].z+=75;
  geomRightWing.vertices[6].z+=75;

  this.rightWing = new THREE.Mesh(geomRightWing, matRightWing);
  // rightWing.position.set(20,10,0);
  this.rightWing.castShadow = true;
  this.rightWing.receiveShadow = true;

  this.rightWing.position.set(20,10,0);
  this.rightWing.rotation.z = 0.2;
  this.mesh.add(this.rightWing);

  // Create Left Wing 
  var geomLeftWing = new THREE.BoxGeometry(40,8,150,1,1,1);
  var matLeftWing = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});

  geomLeftWing.vertices[0].z-=75;
  geomLeftWing.vertices[2].z-=75;
  geomLeftWing.vertices[5].z-=75;
  geomLeftWing.vertices[7].z-=75;

  this.leftWing = new THREE.Mesh(geomLeftWing, matLeftWing);
  // rightWing.position.set(20,10,0);
  this.leftWing.castShadow = true;
  this.leftWing.receiveShadow = true;

  this.leftWing.position.set(20,10,0);
  this.leftWing.rotation.z = 0.2;
  this.mesh.add(this.leftWing);

};

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.nClouds = 100;
  this.clouds = [];
  var stepAngle = Math.PI*2 / this.nClouds;
  for(var i=0; i<this.nClouds; i++){
    var c = new Cloud();
    this.clouds.push(c);
    var a = stepAngle*i;
    var h = 8200 + Math.random()*200;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.position.z = -400-Math.random()*400;
    c.mesh.rotation.z = a + Math.PI/2;
    var s = 1+Math.random()*2;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

Sea = function(){
  var geom = new THREE.CylinderGeometry(2000,2000,800,500,300);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  geom.mergeVertices();
  var l = geom.vertices.length;

  this.waves = [];

  for (var i=0;i<l;i++){
    var v = geom.vertices[i];
    this.waves.push({y:v.y,
                     x:v.x,
                     z:v.z,
                     ang:Math.random()*Math.PI*0.08,
                     amp:0.3 + Math.random()*0.6,
                     speed:0.003 + Math.random()*0.0012
                    });
  };

 


  var mat = new THREE.MeshPhongMaterial({
    color:Colors.blue,
    transparent:true,
    opacity:.8,
    shading:THREE.FlatShading,

  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;

}

Sea.prototype.moveWaves = function (){
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;
  for (var i=0; i<l; i++){
    var v = verts[i];
    var vprops = this.waves[i];
    v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
    vprops.ang += vprops.speed;
  }
  this.mesh.geometry.verticesNeedUpdate=true;
  sea.mesh.rotation.z += .00005;
}

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geom = new THREE.CubeGeometry(32,32,32);
  var mat = new THREE.MeshPhongMaterial({
    color: 0xBFD2DE
  });

  var nBlocs = 3+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*15;
    m.position.y = Math.random()*10;
    m.position.z = Math.random()*10;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = .1 + Math.random()*.9;
    m.scale.set(s,s,s);
    m.castShadow = true;
    m.receiveShadow = true;
    this.mesh.add(m);
  }
}

Raindrop = function(){
  // this.mesh = new THREE.Object3D();
  var geom = new THREE.SphereGeometry(3,3,8,8);
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    shininess:0,
    specular:0xffffff,
    shading:THREE.FlatShading
  });
  
  // console.log("new raindrop")
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.position.y = 400;
  this.mesh.position.x = (Math.random()*750)-200;
  this.mesh.position.z = 0;
  this.mesh.rotation.z = -0.3;
  this.mesh.castShadow = true;
  this.dirty = 0;

}

Drug = function(){
    // this.mesh = new THREE.Object3D();
    var geom = new THREE.SphereGeometry(4,4,1,1);
    var mat = new THREE.MeshPhongMaterial({
        color: 0xFF0000,
        shininess:0,
        specular:0xffffff,
        shading:THREE.FlatShading
    });

    // console.log("new drug")
    this.mesh = new THREE.Mesh(geom,mat);
    this.mesh.position.y = 400;
    this.mesh.position.x = (Math.random()*240)+20;
    this.mesh.position.z = 0;
    this.mesh.castShadow = true;
    this.dirty = 0;
}

Particle = function(){
    var geom = new THREE.TetrahedronGeometry(3,0);
    var mat = new THREE.MeshPhongMaterial({
        color:0x009999,
        shininess:0,
        specular:0xffffff,
        shading:THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom,mat);
}

Particle.prototype.explode = function(pos, color, scale){
    var _this = this;
    var _p = this.mesh.parent;
    this.mesh.material.color = new THREE.Color( color);
    this.mesh.material.needsUpdate = true;
    this.mesh.scale.set(scale, scale, scale);
    var targetX = pos.x + (-1 + Math.random()*2)*50;
    var targetY = pos.y + (-1 + Math.random()*2)*50;
    var speed = .6+Math.random()*.2;
    TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
    TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
    TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
        if(_p) _p.remove(_this.mesh);
        _this.mesh.scale.set(1,1,1);
        particlesPool.unshift(_this);
    }});
}

ParticlesHolder = function (){
    this.mesh = new THREE.Object3D();
    this.particlesInUse = [];
}

ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){

    var nPArticles = density;
    for (var i=0; i<nPArticles; i++){
        var particle;
        if (particlesPool.length) {
            particle = particlesPool.pop();
        }else{
            particle = new Particle();
        }
        this.mesh.add(particle.mesh);
        particle.mesh.visible = true;
        var _this = this;
        particle.mesh.position.y = pos.y;
        particle.mesh.position.x = pos.x;
        particle.explode(pos,color, scale);
    }
}

// RaindropsHolder.prototype.renderRaindrops = function(){
// 	for (var i=0; i<12; i++){
// 		if(this.raindrops[i].mesh.position.x<-300 || this.raindrops[i].mesh.position.y<-200 ){
// 			scene.remove(this.raindrops[i].mesh);
// 			this.raindrops[i] = new Raindrop();
// 			scene.add(this.raindrops[i].mesh);
// 		}
// 		this.raindrops[i].mesh.position.y -= 3.3;
// 		this.raindrops[i].mesh.position.x -= 1200*0.002;
// 	}
// }


// 3D Models
var sea;
var sky;
var bird;
// var	raindropsHolder;
var raindrops = [];
var drugs = [];
var distance = 0;
var surface = null;
var particlesPool = [];

function createWater() {
    // set up our initial vars
    vars["magnitude"]         = 40;
    vars["orbitSpeed"]        = 0.001;
    vars["orbit"]             = true;
    vars["wireframeOpacity"]  = 1;
    vars["raindrops"]         = true;
    vars["elasticity"]        = 0.002;

    var texture = new THREE.TextureLoader().load( "./img/ocean.jpg" );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(7, 6);
    var planeMaterial = new THREE.MeshPhongMaterial({
            map: texture
            // wireframe: true,
            // color: 0xff00ff
    });
    var planeGeom = new THREE.PlaneGeometry(SURFACE_WIDTH, SURFACE_HEIGHT, X_RESOLUTION, Y_RESOLUTION)

    surface  = new THREE.Mesh(planeGeom, planeMaterial);
    surface.rotation.x   =-Math.PI * .5;
    surface.receiveShadow = true;
    surface.overdraw    = true;
    scene.add(surface);

    // go through each vertex
    surfaceVerts  = surface.geometry.vertices;
    sCount  = surfaceVerts.length;
     // console.log(sCount);

    // store vertices in surfaceVerts to make ripple
    while(sCount--)
    {
        var vertex    = surfaceVerts[sCount];
        vertex.springs  = [];
        vertex.velocity = new THREE.Vector3(0, 0, 0);

        vertex.dirty = 0;
        // console.log(vertex.springs);
        // console.log(vertex.velocity);

        // connect this vertex to the ones around it
        if(vertex.x > (-SURFACE_WIDTH * .5))
        {
            // connect to left
            vertex.springs.push({start:sCount, end:sCount-1});
        }

        if(vertex.x < (SURFACE_WIDTH * .5))
        {
            // connect to right
            vertex.springs.push({start:sCount, end:sCount+1});
        }

        if(vertex.y < (SURFACE_HEIGHT * .5))
        {
            // connect above
            vertex.springs.push({start:sCount, end:sCount-(X_RESOLUTION+1)});
        }

        if(vertex.y > (-SURFACE_HEIGHT * .5))
        {
            // connect below
            vertex.springs.push({start:sCount, end:sCount+(X_RESOLUTION+1)});
        }
        // var xVal  = Math.floor((vertex.x / SURFACE_WIDTH) * X_RESOLUTION),
        //     yVal  = Math.floor((vertex.y / SURFACE_HEIGHT) * Y_RESOLUTION);

        // console.log(sCount);
        // console.log(vertex);
        // console.log(yVal);
    }

}

function createRaindrop(){
  var raindrop = new Raindrop();
  raindrops.splice(0,0,raindrop);
  scene.add(raindrop.mesh);
}

function createDrug(){
    var drug = new Drug();
    drugs.splice(0,0,drug);
    scene.add(drug.mesh);
}


function createBird(){
  bird = new Bird();
  bird.mesh.scale.set(.25,.25,.25);
  bird.mesh.position.y = 100;
  bird.mesh.position.x = -30;
  bird.mesh.position.z = 0;
  scene.add(bird.mesh);
}
//
// function createSea(){
//   sea = new Sea();
//   sea.mesh.position.y = -2000;
//   scene.add(sea.mesh);
// }

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -8000;
  scene.add(sky.mesh);
}

function createParticles(){
    for (var i=0; i<10; i++){
        var particle = new Particle();
        particlesPool.push(particle);
    }
    particlesHolder = new ParticlesHolder();
    //ennemiesHolder.mesh.position.y = -game.seaRadius;
    scene.add(particlesHolder.mesh)
}



function updateWater(){
    // console.log(surfaceVerts.length);
    surface.material.map.offset.x +=0.003;
    for (var i =0; i<raindrops.length; i++){
        // console.log(raindrops[i].dirty);

        // console.log(i);
        // var mouseX = raindropsHolder.raindrops[j].mesh.position.x;
        // var mouseY = raindropsHolder.raindrops[j].mesh.position.y;
        //
        // var vector   = new THREE.Vector3((mouseX / container.width) * 2 - 1, -(mouseY / container.height) * 2 + 1, 0.5);
        // projector.unprojectVector(vector, camera);
        //
        // var ray    = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize()),
        //     intersects = ray.intersectObject(surface);
        //
        // // if the ray intersects with the
        // // surface work out where
        // if(intersects.length && intersects.mesh.position.z < 0) {
        //     var iPoint   = intersects[0].point,
        //         xVal = Math.floor((iPoint.x / SURFACE_WIDTH) * X_RESOLUTION),
        //         yVal = Math.floor((iPoint.z / SURFACE_HEIGHT) * Y_RESOLUTION);
        //
        //     xVal     += X_RESOLUTION * .5;
        //     yVal     += Y_RESOLUTION * .5;
        //
        //     index    = (yVal * (X_RESOLUTION + 1)) + xVal;
        //
        //     if(index >= 0 && index < surfaceVerts.length) {
        //         surfaceVerts[index].velocity.z += magnitude;
        //     }
        //
        // console.log(raindrops[i].dirty == 0);
        if (raindrops[i].mesh.position.y < 5 && raindrops[i].dirty == 0 ) {
            raindrops[i].dirty = 1;
            console.log(raindrops[i].dirty == 0);
            // console.log("ripple");
            var iPoint  = raindrops[i].mesh.position,
                xVal  = Math.round(iPoint.x/10),
                yVal  = Math.round(iPoint.z*(-1)/10);

            // console.log(X_RESOLUTION);
            var index   = Math.floor(((Y_RESOLUTION*0.5)-yVal)*(X_RESOLUTION+1)+(xVal+(X_RESOLUTION*0.5)));

            // console.log(index);
            if(index >= 0 && index < surfaceVerts.length) {
                surfaceVerts[index].velocity.z = surfaceVerts[index].velocity.z + vars["magnitude"]/(Math.random()*2+3);
                // surfaceVerts[index].z = 100000;
                // console.log(index);
                // console.log(surfaceVerts[index].y);
            }

        }
        raindrops[i].mesh.position.y -= deltaTime/7;
        raindrops[i].mesh.position.x -= deltaTime/15;

        var diffPos = bird.mesh.position.clone().sub(raindrops[i].mesh.position.clone());
        var d = diffPos.length();
        if (d<20){
            hurt(20);
          particlesHolder.spawnParticles(raindrops[i].mesh.position.clone(), 30, Colors.blue, 1);
          bird.mesh.position.y -= 20;
          bird.mesh.position.x -= 4;
          scene.remove(raindrops[i].mesh);
          raindrops.splice(i,1);

          continue;   
        }
        if(raindrops[i].mesh.position.y < -50){
          scene.remove(raindrops[i].mesh);
          raindrops.splice(i,1);
          continue;
        }
    }
// console.log(surfaceVerts);
    var v = surfaceVerts.length;
   while(v--) {
       if(Math.floor((Math.random() * 200) + 1)% 200 == 0){
           surfaceVerts[v].velocity.z = 2;
       }
        var vertex      = surfaceVerts[v],
            acceleration  = new THREE.Vector3(0, 0, -vertex.z * vars["elasticity"]),
            springs     = vertex.springs,
            s       = springs.length;

        vertex.velocity.add(acceleration);

        while(s--) {
            var spring    = springs[s],
                extension = surfaceVerts[spring.start].z - surfaceVerts[spring.end].z;

            acceleration  = new THREE.Vector3(0, 0, extension * vars["elasticity"] * 50);
            surfaceVerts[spring.end].velocity.add(acceleration);
            surfaceVerts[spring.start].velocity.sub(acceleration);
        }

        vertex.z += vertex.velocity.z;

        vertex.velocity.multiplyScalar(DAMPEN);
    }

    surface.geometry.verticesNeedUpdate=true;

}

function updateBird(){
  var targetY = normalize(mousePos.y,-.75,.75,25, 140);
  var targetX = normalize(mousePos.x,-.75,.75,-140, 140);


  bird.mesh.position.y += (targetY-bird.mesh.position.y)*0.4;
  bird.mesh.position.x += (targetX-bird.mesh.position.x)*0.4;
  // Rotate the plane proportionally to the remaining distance
  bird.mesh.rotation.z = (targetY-bird.mesh.position.y)*0.0328;
  bird.mesh.rotation.x = (bird.mesh.position.y-targetY)*0.0164;
  // bird.propeller.rotation.x += 0.3;
  var theta = Math.floor(Date.now())/100;
  bird.rightWing.rotation.x = Math.cos(theta)*(0.3)-0.3;
  bird.leftWing.rotation.x = Math.cos(theta)*(-0.3)+0.3;

}

function updateDrugs(){
  for (var i =0; i<drugs.length; i++){
      drugs[i].mesh.position.y -= deltaTime/15;
      drugs[i].mesh.position.x -= deltaTime/30;

      var diffPos = bird.mesh.position.clone().sub(drugs[i].mesh.position.clone());
      var d = diffPos.length();
      if (d<20){
          heal(10);
          // particlesHolder.spawnParticles(drugs[i].mesh.position.clone(), 30, Colors.red, 1);
          bird.mesh.rotation.z -= 0.3;
          scene.remove(drugs[i].mesh);
          drugs.splice(i,1);

          continue;
      }
      if(drugs[i].mesh.position.y < -50){
          scene.remove(drugs[i].mesh);
          drugs.splice(i,1);
          continue;
      }
  }
}

function hurt(val){
    if((health - val)>0){
        health -= val;
    }
    else {
        health =0;
        gameOVer();
    }
}

function heal(val){
    if((health + val)<=100){
        health += val;
    }
    else {
        health = 100;
    }
}


function gameOVer(){
    gameOver = true;
}

function normalize(v,vmin,vmax,tmin, tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

function loop(){
    if(gameOver == false){

        var targetY = normalize(mousePos.y,-.75,.75,25, 140);
        var targetX = normalize(mousePos.x,-.75,.75,-140, 140);


        camera.position.y += (targetY-bird.mesh.position.y)*0.1;
        camera.position.x += (targetX-bird.mesh.position.x)*0.1;


        var displey = Math.floor(distance/10);
        document.getElementById("score").innerHTML = displey.toString();
        document.getElementById("health").innerHTML = health.toString();
        newTime = new Date().getTime();
        deltaTime = newTime-oldTime;
        oldTime = newTime;

        distance += Math.floor(deltaTime/100000);

        var rainFreq = Math.floor(2+(1400/(distance+100)));

        if(distance % rainFreq == 0){

            createRaindrop();
        }
        if(distance % 150 == 0) {
            createDrug();
        }
        updateBird();
        updateDrugs();
        updateWater();
        // sea.mesh.rotation.z += .0005;

        sky.mesh.rotation.z += .00005;


        renderer.render(scene, camera);
        requestAnimationFrame(loop);
        distance ++;
    }
    else{
        document.getElementById("health").innerHTML = '0';
        var msg = "Game Over! \nFinal Score: "+Math.floor(distance/10);
        window.alert(msg);
    }
}

function init(event){
  document.addEventListener('mousemove', handleMouseMove, false);
  createScene();
  createLights();
  createBird();
  // createSea();
  createWater();
  createSky();
  createParticles();
  loop();
}



// HANDLE MOUSE EVENTS

var mousePos = { x: 0, y: 0 };

function handleMouseMove(event) {
  var tx = -1 + (event.clientX / WIDTH)*2;
  var ty = 1 - (event.clientY / HEIGHT)*2;
  mousePos = {x:tx, y:ty};
}

window.addEventListener('load', init, false);
