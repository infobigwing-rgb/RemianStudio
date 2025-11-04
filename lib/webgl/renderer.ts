export class WebGLRenderer {
  private gl: WebGLRenderingContext | null = null
  private canvas: HTMLCanvasElement | null = null
  private programs: Map<string, WebGLProgram> = new Map()
  private textures: Map<string, WebGLTexture> = new Map()

  initialize(canvas: HTMLCanvasElement): boolean {
    this.canvas = canvas
    this.gl = canvas.getContext("webgl2") || canvas.getContext("webgl")

    if (!this.gl) {
      console.error("WebGL not supported")
      return false
    }

    this.setupShaders()
    return true
  }

  private setupShaders() {
    if (!this.gl) return

    // Basic vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      uniform mat3 u_matrix;

      void main() {
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
        v_texCoord = a_texCoord;
      }
    `

    // Fragment shader with color grading support
    const fragmentShaderSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      uniform float u_opacity;
      uniform vec3 u_colorAdjust; // brightness, contrast, saturation
      uniform vec3 u_hsl; // hue, saturation, lightness
      uniform float u_blur;

      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        
        // Apply brightness and contrast
        color.rgb = (color.rgb - 0.5) * u_colorAdjust.y + 0.5 + u_colorAdjust.x;
        
        // Apply HSL adjustments
        vec3 hsv = rgb2hsv(color.rgb);
        hsv.x += u_hsl.x;
        hsv.y *= u_hsl.y;
        hsv.z *= u_hsl.z;
        color.rgb = hsv2rgb(hsv);
        
        // Apply opacity
        color.a *= u_opacity;
        
        gl_FragColor = color;
      }
    `

    const program = this.createProgram(vertexShaderSource, fragmentShaderSource)
    if (program) {
      this.programs.set("default", program)
    }
  }

  private createProgram(vertexSource: string, fragmentSource: string): WebGLProgram | null {
    if (!this.gl) return null

    const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource)

    if (!vertexShader || !fragmentShader) return null

    const program = this.gl.createProgram()
    if (!program) return null

    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error("Program link error:", this.gl.getProgramInfoLog(program))
      return null
    }

    return program
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null

    const shader = this.gl.createShader(type)
    if (!shader) return null

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }

    return shader
  }

  loadTexture(id: string, image: HTMLImageElement | HTMLVideoElement): void {
    if (!this.gl) return

    const texture = this.gl.createTexture()
    if (!texture) return

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image)

    // Set texture parameters
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)

    this.textures.set(id, texture)
  }

  renderLayer(
    textureId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    opacity: number,
    rotation: number,
    effects?: any[],
  ): void {
    if (!this.gl || !this.canvas) return

    const program = this.programs.get("default")
    const texture = this.textures.get(textureId)

    if (!program || !texture) return

    // Set up geometry
    const positions = new Float32Array([x, y, x + width, y, x, y + height, x + width, y + height])

    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])

    // Create and bind buffers
    const positionBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW)

    const positionLocation = this.gl.getAttribLocation(program, "a_position")
    this.gl.enableVertexAttribArray(positionLocation)
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0)

    const texCoordBuffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW)

    const texCoordLocation = this.gl.getAttribLocation(program, "a_texCoord")
    this.gl.enableVertexAttribArray(texCoordLocation)
    this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0)

    // Set uniforms
    const opacityLocation = this.gl.getUniformLocation(program, "u_opacity")
    this.gl.uniform1f(opacityLocation, opacity)

    // Apply effects
    const colorAdjust = [0, 1, 1] // brightness, contrast, saturation
    const hsl = [0, 1, 1] // hue, saturation, lightness

    if (effects) {
      for (const effect of effects) {
        if (effect.type === "brightnessContrast") {
          colorAdjust[0] = effect.parameters.brightness || 0
          colorAdjust[1] = effect.parameters.contrast || 1
        } else if (effect.type === "hueSaturation") {
          hsl[0] = effect.parameters.hue || 0
          hsl[1] = effect.parameters.saturation || 1
        }
      }
    }

    const colorAdjustLocation = this.gl.getUniformLocation(program, "u_colorAdjust")
    this.gl.uniform3fv(colorAdjustLocation, colorAdjust)

    const hslLocation = this.gl.getUniformLocation(program, "u_hsl")
    this.gl.uniform3fv(hslLocation, hsl)

    // Bind texture
    this.gl.activeTexture(this.gl.TEXTURE0)
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture)

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }

  clear(): void {
    if (!this.gl) return
    this.gl.clearColor(0, 0, 0, 0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
  }

  dispose(): void {
    if (!this.gl) return

    // Clean up textures
    this.textures.forEach((texture) => {
      this.gl?.deleteTexture(texture)
    })
    this.textures.clear()

    // Clean up programs
    this.programs.forEach((program) => {
      this.gl?.deleteProgram(program)
    })
    this.programs.clear()
  }
}
