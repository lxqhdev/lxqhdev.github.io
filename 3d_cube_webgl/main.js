const canvas = document.querySelector("#glCanvas");
const gl = canvas.getContext("webgl", { antialias: true });

if (!gl) { alert("WebGL not supported"); }

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, document.getElementById("vs").text));
gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("fs").text));
gl.linkProgram(program);
gl.useProgram(program);

const vertices = new Float32Array([
    -1,-1,-1, 0.9,0.1,0.1,  1,-1,-1, 0.9,0.1,0.1,  1, 1,-1, 0.9,0.1,0.1, -1, 1,-1, 0.9,0.1,0.1,
    -1,-1, 1, 0.1,0.9,0.1,  1,-1, 1, 0.1,0.9,0.1,  1, 1, 1, 0.1,0.9,0.1, -1, 1, 1, 0.1,0.9,0.1,
    -1,-1,-1, 0.1,0.1,0.9, -1, 1,-1, 0.1,0.1,0.9, -1, 1, 1, 0.1,0.1,0.9, -1,-1, 1, 0.1,0.1,0.9,
     1,-1,-1, 0.9,0.9,0.1,  1, 1,-1, 0.9,0.9,0.1,  1, 1, 1, 0.9,0.9,0.1,  1,-1, 1, 0.9,0.9,0.1,
    -1, 1,-1, 0.1,0.9,0.9,  1, 1,-1, 0.1,0.9,0.9,  1, 1, 1, 0.1,0.9,0.9, -1, 1, 1, 0.1,0.9,0.9,
    -1,-1,-1, 0.9,0.1,0.9,  1,-1,-1, 0.9,0.1,0.9,  1,-1, 1, 0.9,0.1,0.9, -1,-1, 1, 0.9,0.1,0.9
]);

const indices = new Uint16Array([
    0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23
]);

const vBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const iBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

const posAttrib = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(posAttrib);
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 24, 0);

const colorAttrib = gl.getAttribLocation(program, "color");
gl.enableVertexAttribArray(colorAttrib);
gl.vertexAttribPointer(colorAttrib, 3, gl.FLOAT, false, 24, 12);

const modelViewLoc = gl.getUniformLocation(program, "modelViewMatrix");
const projLoc = gl.getUniformLocation(program, "projectionMatrix");

let rotationX = 0;
let rotationY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

canvas.addEventListener('mousedown', e => { isDragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; });
window.addEventListener('mouseup', () => isDragging = false);
window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    
    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;
    
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

function resize() {
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== canvas.clientWidth * dpr || canvas.height !== canvas.clientHeight * dpr) {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

function render() {
    resize();
    gl.clearColor(0.05, 0.05, 0.05, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    const aspect = canvas.width / canvas.height;
    const pMat = new Float32Array([1.8/aspect,0,0,0, 0,1.8,0,0, 0,0,-1.02,-1, 0,0,-0.2,0]);


    const sx = Math.sin(rotationX), cx = Math.cos(rotationX);
    const sy = Math.sin(rotationY), cy = Math.cos(rotationY);

    const mvMat = new Float32Array([
        cy, sx*sy, -cx*sy, 0,
        0,  cx,    sx,     0,
        sy, -sx*cy, cx*cy, 0,
        0,  0,     -5,     1
    ]);

    gl.uniformMatrix4fv(projLoc, false, pMat);
    gl.uniformMatrix4fv(modelViewLoc, false, mvMat);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);