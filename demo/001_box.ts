import { box } from "./assets/box";
import * as s3 from "../src";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext;

const vertexShader = `
attribute vec3 position;
attribute vec4 color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying lowp vec4 vColor;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vColor = color;
}
`

const fragmentShader = `
varying lowp vec4 vColor;

void main(void) {
    gl_FragColor = vColor;
}
`

//链接着色器程序
function loadShader(type: number, source: string, shadername = "shader") {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw Error(`${shadername}: \n` + gl.getShaderInfoLog(shader));
    }
    return shader;
}

let vShader = loadShader(gl.VERTEX_SHADER, vertexShader, "vertex shader");
let fShader = loadShader(gl.FRAGMENT_SHADER, fragmentShader, "fragment shader");

let program = gl.createProgram();
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw Error("shader program: \n" + gl.getProgramInfoLog(program));
}
gl.deleteShader(vShader);
gl.deleteShader(fShader);

//获取着色器变量地址
const attribLocations = {
    vertexPosition: gl.getAttribLocation(program, "position"),
    vertexColor: gl.getAttribLocation(program, "color"),
}
const uniformLocations = {
    projectionMatrix: gl.getUniformLocation(program, "projectionMatrix"),
    modelViewMatrix: gl.getUniformLocation(program, "modelViewMatrix"),
}

//初始化顶点缓冲对象
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(box.vertices), gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(box.colors), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(box.indices), gl.STATIC_DRAW);

const projectionMatrix = new s3.Mat4().perspective(s3.degToRad(45), canvas.clientWidth / canvas.clientHeight, 0.1, 100);
const modelViewMatrix = new s3.Mat4();
const rotation = new s3.Euler();

let now = Date.now(), then = now, dt = 0;

function getDeltaTime() {
    now =  Date.now(); 
    dt = now - then;
    then = now;
    return dt * 0.001;
}

function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocations.vertexColor);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
    modelViewMatrix.makeRotationFromEuler(rotation);
    modelViewMatrix.tranlateFromCartesianCoords(0, 0, -10);
    
    gl.uniformMatrix4fv(uniformLocations.projectionMatrix, false, projectionMatrix.elements);
    gl.uniformMatrix4fv(uniformLocations.modelViewMatrix, false, modelViewMatrix.elements);

    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    let dt = getDeltaTime();
    rotation.x += 0.25 * dt;
    rotation.y += 2 * dt;
    rotation.z += dt;
}

function render() {

    drawScene();
    requestAnimationFrame(render);
}
render();