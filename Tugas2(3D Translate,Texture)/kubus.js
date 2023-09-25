const vertexShaderText = `
  precision mediump float;

  attribute vec3 vertPosition;
  attribute vec2 vertTexCoord;
  varying vec2 fragTexCoord;
  uniform mat4 mWorld;
  uniform mat4 mView;
  uniform mat4 mProj;

  void main() {
    fragTexCoord = vertTexCoord;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
  }
`;

const fragmentShaderText = `
  precision mediump float;
  varying vec2 fragTexCoord;
  uniform sampler2D sampler;

  void main() {
    gl_FragColor = texture2D(sampler, fragTexCoord);
  }
`;

//fix issue "mat4 is not defined"
const mat4 = glMatrix.mat4
var isAnimating = true; // Animasi dimulai secara default
var xTranslation = 0;
var yTranslation = 0;

var InitDemo = function () {
  console.log("it works!");

  //mendapatkan id dari komponen html
  var canvas = document.getElementById("game-surface");
  var xSlider = document.getElementById("x-slider");
  var xValue = document.getElementById("x-value");
  var ySlider = document.getElementById("y-slider");
  var yValue = document.getElementById("y-value");
  var depthSlider = document.getElementById("depth-slider");
  var depthValue = document.getElementById("depth-value");

  //getcontext webgl untuk insialisasi nanti
  var gl = canvas.getContext("webgl");
  if (!gl) {
    console.log("tidak support tanpa experimental webgl");
    alert("browser tidak support webgl");
  }
  //set warna background sebagai inisialisasi webgl
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.COLOR_DEPTH_BIT);
  //biar warna yang ditampilin didepan sesuai 
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  //create shader
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  //memasukkan kode string di atas ke fungsi beneran
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  //compile shader (fungsi beneran)
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR COMPILING VERTEX SHADER",
      gl.getShaderInfoLog(vertexShader)
    );
    return;
  }
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(
      "ERROR COMPILING FRAGMENT SHADER",
      gl.getShaderInfoLog(fragmentShader)
    );
    return;
  }

  //menjalankan program secara utuh menggunakan graphics card
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("ERROR LINKING PROGRAM", gl.getProgramInfoLog(program));
    return;
  }

  //memvalidasi (debug) apakah program secara keseluruhan no error
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("ERROR VALIDATING PROGRAM", gl.getProgramInfoLog(program));
    return;
  }
  //program sudah selesai disetup dan siap untuk menerima vertices
  //semua kode dibawah ini adalah untuk menentukan vertices yang akan digambar

	// var boxVertices = 
	// [ // X, Y, Z           U, V
	// 	// Top
	// 	-1.0, 1.0, -1.0,   0, 0,
	// 	-1.0, 1.0, 1.0,    0, 1,
	// 	1.0, 1.0, 1.0,     1, 1,
	// 	1.0, 1.0, -1.0,    1, 0,

	// 	// Left
	// 	-1.0, 1.0, 1.0,    0, 0,
	// 	-1.0, -1.0, 1.0,   1, 0,
	// 	-1.0, -1.0, -1.0,  1, 1,
	// 	-1.0, 1.0, -1.0,   0, 1,

	// 	// Right
	// 	1.0, 1.0, 1.0,    1, 1,
	// 	1.0, -1.0, 1.0,   0, 1,
	// 	1.0, -1.0, -1.0,  0, 0,
	// 	1.0, 1.0, -1.0,   1, 0,

	// 	// Front
	// 	1.0, 1.0, 1.0,    1, 1,
	// 	1.0, -1.0, 1.0,    1, 0,
	// 	-1.0, -1.0, 1.0,    0, 0,
	// 	-1.0, 1.0, 1.0,    0, 1,

	// 	// Back
	// 	1.0, 1.0, -1.0,    0, 0,
	// 	1.0, -1.0, -1.0,    0, 1,
	// 	-1.0, -1.0, -1.0,    1, 1,
	// 	-1.0, 1.0, -1.0,    1, 0,

	// 	// Bottom
	// 	-1.0, -1.0, -1.0,   1, 1,
	// 	-1.0, -1.0, 1.0,    1, 0,
	// 	1.0, -1.0, 1.0,     0, 0,
	// 	1.0, -1.0, -1.0,    0, 1,
	// ];

	// var boxIndices =
	// [
	// 	// Top
	// 	0, 1, 2,
	// 	0, 2, 3,

	// 	// Left
	// 	5, 4, 6,
	// 	6, 4, 7,

	// 	// Right
	// 	8, 9, 10,
	// 	8, 10, 11,

	// 	// Front
	// 	13, 12, 14,
	// 	15, 14, 12,

	// 	// Back
	// 	16, 17, 18,
	// 	16, 18, 19,

	// 	// Bottom
	// 	21, 20, 22,
	// 	22, 20, 23
	// ];

  //testing start---------------------------------------------------------------------------
  var sphereVertices = [];
  var sphereIndices = [];

  var latitudeBands = 30;
  var longitudeBands = 30;
  var radius = 1.0;

  for (var lat = 0; lat <= latitudeBands; lat++) {
    var theta = (lat * Math.PI) / latitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (var lon = 0; lon <= longitudeBands; lon++) {
      var phi = (lon * 2 * Math.PI) / longitudeBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (lon / longitudeBands);
      var v = 1 - (lat / latitudeBands);

      sphereVertices.push(x * radius, y * radius, z * radius, u, v);
    }
  }

  for (var lat = 0; lat < latitudeBands; lat++) {
    for (var lon = 0; lon < longitudeBands; lon++) {
      var first = lat * (longitudeBands + 1) + lon;
      var second = first + longitudeBands + 1;
      sphereIndices.push(first, second, first + 1);
      sphereIndices.push(second, second + 1, first + 1);
    }
  }
  //testing end-----------------------------------------------

  var boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereVertices), gl.STATIC_DRAW);

  var boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);

  var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
  var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");

  gl.vertexAttribPointer(
    positionAttribLocation, // attribut location
    3, // number element per attribut
    gl.FLOAT, //tipe elemen
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, //size setiap vertex
    0 //offset
  );

  gl.vertexAttribPointer(
    texCoordAttribLocation, // attribut location
    2, // number element per attribut
    gl.FLOAT, //tipe elemen
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, //size setiap vertex
    3 * Float32Array.BYTES_PER_ELEMENT //offset
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(texCoordAttribLocation);
  
  //membuat texture
  var boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById("crate-image"));
  gl.bindTexture(gl.TEXTURE_2D, null);

  //program harus aktif dulu biar opengl state machine bisa menggunakan getuniformlocation
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj"); 
  
  //set value biar disimpan ke ram / cpu
  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);

  // mat4.identity(viewMatrix);
  //view dibuat seperti kamera
  mat4.lookAt(viewMatrix, [0, 0, -10], [0, 0, 0], [0, 1, 0]);

  // mat4.identity(projMatrix);
  //proj dibuat seperti perspektif
  mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

  //passing value diatas ke gpu (variabel matWorldUnifromLocation, view, proj)
  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

  //buat rotasi 2 sumbu
  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);
  
  //
  //MOUSE LISTENER
  //
  canvas.addEventListener("click", function () {
    isAnimating = !isAnimating; // Balikkan nilai isAnimating
    if (isAnimating) {
      requestAnimationFrame(loop); // Mulai ulang animasi jika isAnimating true
    }
  });

  //
  //KEYBOARD LISTENER
  //
  document.addEventListener("keydown", function (event) {
    if (event.keyCode === 32) { // Tombol spasi
      isAnimating = !isAnimating; // Balikkan nilai isAnimating
      if (isAnimating) {
        requestAnimationFrame(loop); // Mulai ulang animasi jika isAnimating true
      }
    }
  });

  //
  //X SLIDER
  //
  xSlider.addEventListener("input", function () {
    xTranslation = parseFloat(xSlider.value);
    xValue.innerText = xTranslation;
    mat4.translate(worldMatrix, identityMatrix, [xTranslation, yTranslation, 0]);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  });

  //
  //Y SLIDER
  //
  ySlider.addEventListener("input", function () {
    yTranslation = parseFloat(ySlider.value);
    yValue.innerText = yTranslation;
    mat4.translate(worldMatrix, identityMatrix, [xTranslation, yTranslation, 0]);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  });

  //
  //SCALE (CAMERA DEPTH) SLIDER
  //
  depthSlider.addEventListener("input", function () {
    var depth = parseFloat(depthSlider.value);
    depthValue.innerText = depth;
    // mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, depth);
    mat4.lookAt(viewMatrix, [0, 0, depth], [0, 0, 0], [0, 1, 0]);
    // gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  });
  
  // main render loop
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var angle = 0;
  var loop = function (){
    if(isAnimating){
    angle = performance.now() / 1000 / 2 * 2 * Math.PI;
    
    //MASIH GAGAL TRANSLASI REALTIME
    // // //translasi realtime
    // mat4.identity(worldMatrix);
    // mat4.translate(worldMatrix, identityMatrix, [xTranslation, yTranslation, 0]);

    // mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]); //ini buat rotasi satu sumbu saja
    //berikut ini buat rotasi 2sumbu
    mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(yRotationMatrix, identityMatrix, angle / 1, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    }

    //set warna background di setiap frame loop
    gl.clearColor(0, 0, 0.255, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawElements(gl.TRIANGLES, sphereIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};
