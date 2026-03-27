const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl', { antialias: true });

if (!gl) {
    console.error('WebGL not supported');
}

// Shader Sources
const vs = `
    attribute vec4 position;
    void main() {
        gl_Position = position;
    }
`;

const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec3 color = vec3(0.02, 0.02, 0.05);
        
        // Subtle animated light trails
        float pulse = sin(u_time * 0.5 + uv.x * 5.0) * 0.1;
        color += vec3(0.0, 0.4, 0.3) * (0.01 / abs(uv.y - 0.5 + pulse));
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const program = gl.createProgram();
gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
gl.linkProgram(program);

const positionLoc = gl.getAttribLocation(program, 'position');
const timeLoc = gl.getUniformLocation(program, 'u_time');
const resLoc = gl.getUniformLocation(program, 'u_resolution');

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();

function render(time) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    
    gl.uniform1f(timeLoc, time * 0.001);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);