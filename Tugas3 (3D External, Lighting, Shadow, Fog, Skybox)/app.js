//fix issue "mat4 is not defined"
const mat4 = glMatrix.mat4
var isAnimating = true; // Animasi dimulai secara default
var xTranslation = 0;
var yTranslation = 0;
var model;

var InitDemo = function(){
  loadTextResource('/shader.vs.glsl', function(vsErr, vsText){
    if(vsErr){
      alert('Fatal Error getting vs shader');
      console.error(vsErr);
    }else{
      loadTextResource('/shader.fs.glsl', function(fsErr, fsText){
        if(fsErr){
          alert('Fatal Error getting fs shader');
          console.error(fsErr);
        }else{
          loadJSONResource('/gelas.json', function(modelErr, modelObj){
            if(modelErr){
              alert('Fatal Error getting json model');
              console.error(modelErr);
            }else{
              loadImage('gold.png', function(imgErr, img){
                if(imgErr){
                  alert('Fatal Error getting image texture');
                  console.error(imgErr);
                }else{
                  RunDemo(vsText, fsText, img, modelObj);
                }
              });
              // RunDemo(vsText, fsText, modelObj);
            }
          });
          // RunDemo(vsText, fsText);
        }
      });
    }
  });
};

var RunDemo = function (vertexShaderText, fragmentShaderText, extImage, extModel) {
  console.log("it works!");
  model = extModel;

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

	var extVertices = extModel.meshes[0].vertices;
	var extIndices = [].concat.apply([], extModel.meshes[0].faces);
	var extTexCoords = extModel.meshes[0].texturecoords[0];

	var extPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, extPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(extVertices), gl.STATIC_DRAW);

	var extTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, extTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(extTexCoords), gl.STATIC_DRAW);

	var extIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, extIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(extIndices), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, extPosVertexBufferObject);
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0 // Offset from the beginning of a single vertex to this attribute
	);
	gl.enableVertexAttribArray(positionAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, extTexCoordVertexBufferObject);
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // Number of elements per attribute
		gl.FLOAT, // Type of elements
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
		0
	);
	gl.enableVertexAttribArray(texCoordAttribLocation);
  
  //membuat texture
  var extTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, extTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, extImage);
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
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    
    //MASIH GAGAL TRANSLASI REALTIME
    // // //translasi realtime
    // mat4.identity(worldMatrix);
    // mat4.translate(worldMatrix, identityMatrix, [xTranslation, yTranslation, 0]);

    // mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]); //ini buat rotasi satu sumbu saja
    //berikut ini buat rotasi 2sumbu
    mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    mat4.rotate(yRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    }

    //set warna background di setiap frame loop
    gl.clearColor(0.3, 0.9, 0.1, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    gl.bindTexture(gl.TEXTURE_2D, extTexture);
    gl.activeTexture(gl.TEXTURE0);

    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawElements(gl.TRIANGLES, extIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
};
