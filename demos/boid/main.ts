import './style.css'
import init, { World } from './rust/pkg'

const WORLD_W = 4000
const WORLD_H = 3000

async function run() {
  await init()

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const world = World.new(WORLD_W, WORLD_H, 3000)

  const gl = canvas.getContext('webgl2')!
  if (!gl) {
    document.body.innerHTML = '<p style="color:white;padding:2rem">WebGL2 not supported</p>'
    return
  }

  const vertSrc = `#version 300 es
    in vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_camera;

    void main() {
      vec2 screen = a_position - u_camera;
      vec2 clip = (screen / u_resolution) * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
      gl_PointSize = 1.0;
    }
  `

  const fragSrc = `#version 300 es
    precision mediump float;
    out vec4 outColor;

    void main() {
      outColor = vec4(0.4, 0.8, 1.0, 0.8);
    }
  `

  function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    return shader
  }

  const vert = createShader(gl, gl.VERTEX_SHADER, vertSrc)!
  const frag = createShader(gl, gl.FRAGMENT_SHADER, fragSrc)!

  const program = gl.createProgram()!
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program))
    return
  }

  gl.useProgram(program)

  const posLoc = gl.getAttribLocation(program, 'a_position')
  const resLoc = gl.getUniformLocation(program, 'u_resolution')
  const camLoc = gl.getUniformLocation(program, 'u_camera')

  const vao = gl.createVertexArray()!
  gl.bindVertexArray(vao)

  const posBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  gl.uniform2f(resLoc, canvas.width, canvas.height)
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
  gl.clearColor(0, 0, 0, 1)

  // Camera starts centered on the world
  let camX = (WORLD_W - canvas.width) / 2
  let camY = (WORLD_H - canvas.height) / 2

  // Pan by click-drag
  let dragging = false
  let dragStartX = 0
  let dragStartY = 0
  let camStartX = 0
  let camStartY = 0

  canvas.addEventListener('mousedown', e => {
    dragging = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    camStartX = camX
    camStartY = camY
    canvas.style.cursor = 'grabbing'
  })

  canvas.addEventListener('mousemove', e => {
    if (!dragging) return
    camX = Math.max(0, Math.min(WORLD_W - canvas.width,  camStartX - (e.clientX - dragStartX)))
    camY = Math.max(0, Math.min(WORLD_H - canvas.height, camStartY - (e.clientY - dragStartY)))
  })

  const stopDrag = () => { dragging = false; canvas.style.cursor = 'grab' }
  canvas.addEventListener('mouseup', stopDrag)
  canvas.addEventListener('mouseleave', stopDrag)
  canvas.style.cursor = 'grab'

  function frame() {
    world.tick()
    const positions = world.positions()

    gl.uniform2f(camLoc, camX, camY)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW)
    gl.drawArrays(gl.POINTS, 0, positions.length / 2)

    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

run()
