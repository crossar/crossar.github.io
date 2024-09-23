// Vertex shader
const vertexShaderSource = `
attribute vec4 a_position;
void main() {
    gl_Position = a_position;
}
`;

// Fragment shader
// const fragmentShaderSource = `
// precision mediump float;

// uniform float u_time;
// uniform vec2 u_resolution;

// const float s3 = 1.7320508075688772;
// const float i3 = 0.5773502691896258;

// const mat2 tri2cart = mat2(1.0, 0.0, -0.5, 0.5 * s3);
// const mat2 cart2tri = mat2(1.0, 0.0, i3, 2.0 * i3);

// //////////////////////////////////////////////////////////////////////
// // cosine based palette with pink and purple

// vec3 pal(float t) {
//     const vec3 a = vec3(0.5);
//     const vec3 b = vec3(0.5);
//     const vec3 c = vec3(0.8, 0.5, 0.8); // Purple-pink gradient
//     const vec3 d = vec3(0.3, 0.1, 0.2); // Offset for more color variance

//     return clamp(a + b * cos(6.28318 * (c * t + d)), 0.0, 1.0);
// }

// //////////////////////////////////////////////////////////////////////
// // hash functions for randomness

// #define HASHSCALE1 0.1031
// #define HASHSCALE3 vec3(443.897, 441.423, 437.195)

// float hash12(vec2 p) {
//     vec3 p3 = fract(vec3(p.xyx) * HASHSCALE1);
//     p3 += dot(p3, p3.yzx + 19.19);
//     return fract((p3.x + p3.y) * p3.z);
// }

// vec2 hash23(vec3 p3) {
//     p3 = fract(p3 * HASHSCALE3);
//     p3 += dot(p3, p3.yzx + 19.19);
//     return fract((p3.xx + p3.yz) * p3.zy);
// }

// //////////////////////////////////////////////////////////////////////
// // barycentric coordinates for triangle grid

// vec3 bary(vec2 v0, vec2 v1, vec2 v2) {
//     float inv_denom = 1.0 / (v0.x * v1.y - v1.x * v0.y);
//     float v = (v2.x * v1.y - v1.x * v2.y) * inv_denom;
//     float w = (v0.x * v2.y - v2.x * v0.y) * inv_denom;
//     float u = 1.0 - v - w;
//     return vec3(u, v, w);
// }

// //////////////////////////////////////////////////////////////////////
// // distance to line segment

// float dseg(vec2 xa, vec2 ba) {
//     return length(xa - ba * clamp(dot(xa, ba) / dot(ba, ba), 0.0, 1.0));
// }

// //////////////////////////////////////////////////////////////////////
// // random point on a circle

// vec2 randCircle(vec3 p) {
//     vec2 rt = hash23(p);
//     float r = sqrt(rt.x);
//     float theta = 6.283185307179586 * rt.y;
//     return r * vec2(cos(theta), sin(theta));
// }

// //////////////////////////////////////////////////////////////////////
// // time-varying cubic spline

// vec2 randCircleSpline(vec2 p, float t) {
//     float t1 = floor(t);
//     t -= t1;

//     vec2 pa = randCircle(vec3(p, t1 - 1.0));
//     vec2 p0 = randCircle(vec3(p, t1));
//     vec2 p1 = randCircle(vec3(p, t1 + 1.0));
//     vec2 pb = randCircle(vec3(p, t1 + 2.0));

//     vec2 m0 = 0.5 * (p1 - pa);
//     vec2 m1 = 0.5 * (pb - p0);

//     vec2 c3 = 2.0 * p0 - 2.0 * p1 + m0 + m1;
//     vec2 c2 = -3.0 * p0 + 3.0 * p1 - 2.0 * m0 - m1;
//     vec2 c1 = m0;
//     vec2 c0 = p0;

//     return (((c3 * t + c2) * t + c1) * t + c0) * 0.8;
// }

// //////////////////////////////////////////////////////////////////////
// // displaced point on the triangle grid

// vec2 triPoint(vec2 p) {
//     float t0 = hash12(p);
//     return tri2cart * p + 0.45 * randCircleSpline(p, 0.15 * u_time + t0);
// }

// //////////////////////////////////////////////////////////////////////
// // main shading function for triangle coloring

// void tri_color(in vec2 p, in vec4 t0, in vec4 t1, in vec4 t2, in float scl, inout vec4 cw) {
//     vec2 p0 = p - t0.xy;
//     vec2 p10 = t1.xy - t0.xy;
//     vec2 p20 = t2.xy - t0.xy;

//     vec3 b = bary(p10, p20, p0);

//     float d10 = dseg(p0, p10);
//     float d20 = dseg(p0, p20);
//     float d21 = dseg(p - t1.xy, t2.xy - t1.xy);

//     float d = min(min(d10, d20), d21);
//     d *= -sign(min(b.x, min(b.y, b.z)));

//     if (d < 0.5 * scl) {
//         vec2 tsum = t0.zw + t1.zw + t2.zw;
//         vec3 h_tri = vec3(hash12(tsum + t0.zw), hash12(tsum + t1.zw), hash12(tsum + t2.zw));

//         vec2 pctr = (t0.xy + t1.xy + t2.xy) / 3.0;
//         float theta = 1.0 + 0.01 * u_time;
//         vec2 dir = vec2(cos(theta), sin(theta));
//         float grad_input = dot(pctr, dir) - sin(0.05 * u_time);

//         float h0 = sin(0.7 * grad_input) * 0.5 + 0.5;
//         h_tri = mix(vec3(h0), h_tri, 0.4);

//         float h = dot(h_tri, b);
//         vec3 c = pal(h);

//         float w = smoothstep(0.5 * scl, -0.5 * scl, d);
//         cw += vec4(w * c, w);
//     }
// }

// //////////////////////////////////////////////////////////////////////
// // main function

// void main() {
//     float scl = 4.1 / u_resolution.y;

//     vec2 p = (gl_FragCoord.xy - 0.5 - 0.5 * u_resolution.xy) * scl;
//     vec2 tfloor = floor(cart2tri * p + 0.5);

//     vec2 pts[9];
//     for (int i = 0; i < 3; ++i) {
//         for (int j = 0; j < 3; ++j) {
//             pts[3 * i + j] = triPoint(tfloor + vec2(i - 1, j - 1));
//         }
//     }

//     vec4 cw = vec4(0.0);

//     for (int i = 0; i < 2; ++i) {
//         for (int j = 0; j < 2; ++j) {
//             vec4 t00 = vec4(pts[3 * i + j], tfloor + vec2(i - 1, j - 1));
//             vec4 t10 = vec4(pts[3 * i + j + 3], tfloor + vec2(i, j - 1));
//             vec4 t01 = vec4(pts[3 * i + j + 1], tfloor + vec2(i - 1, j));
//             vec4 t11 = vec4(pts[3 * i + j + 4], tfloor + vec2(i, j));

//             tri_color(p, t00, t10, t11, scl, cw);
//             tri_color(p, t00, t11, t01, scl, cw);
//         }
//     }

//     gl_FragColor = cw / cw.w;
// }
// `;
const fragmentShaderSource = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

vec3 hexToRgb(float r, float g, float b) {
    return vec3(r / 255.0, g / 255.0, b / 255.0);
}

void main() {
    float aspect_ratio = u_resolution.y / u_resolution.x;
    vec2 uv = gl_FragCoord.xy / u_resolution.x;
    uv -= vec2(0.5, 0.5 * aspect_ratio);
    float rot = radians(-30.0 - u_time);
    mat2 rotation_matrix = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
    uv = rotation_matrix * uv;
    vec2 scaled_uv = 20.0 * uv;
    vec2 tile = fract(scaled_uv);
    float tile_dist = min(min(tile.x, 1.0 - tile.x), min(tile.y, 1.0 - tile.y));
    float square_dist = length(floor(scaled_uv));
    float edge = sin(u_time - square_dist * 20.0);
    edge = mod(edge * edge, edge / edge);
    float value = mix(tile_dist, 1.0 - tile_dist, step(1.0, edge));
    edge = pow(abs(1.0 - edge), 2.2) * 0.5;
    value = smoothstep(edge - 0.05, edge, 0.95 * value);
    value += square_dist * 0.1;
    value *= 0.8 - 0.2;

    // Set your color using HTML hex, for example: Pink (#ff69b4)
    vec3 color = hexToRgb(201.0, 68.0, 91.0) * pow(value, 2.0);
    gl_FragColor = vec4(color, 1.0);
}
`;

const createShader = (gl, type, source) => {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Shader compile failed: ', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return;
	}
	return shader;
};

const createProgram = (gl, vertexShader, fragmentShader) => {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Program link failed: ', gl.getProgramInfoLog(program));
		return null;
	}
	return program;
};

const getRenderFunction = (args, callback) => {
	const {
		gl,
		program,
		positionAttributeLocation,
		resolutionUniformLocation,
		timeUniformLocation,
		positionBuffer,
		fps = 15,
		speed = 0.5,
	} = args;
	const interval = 1000 / fps; // Time per frame in milliseconds
	let lastFrameTime = 0;
	return function render(time) {
		time *= speed * 0.001; // Convert to seconds

		// Frame rate limiting
		const currentTime = performance.now();
		const delta = currentTime - lastFrameTime;

		if (delta < interval) {
			requestAnimationFrame(render);
			return;
		}

		lastFrameTime = currentTime;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(program);

		// Set resolution and time uniform
		gl.uniform2f(
			resolutionUniformLocation,
			gl.canvas.width,
			gl.canvas.height
		);
		gl.uniform1f(timeUniformLocation, time);

		// Bind the position buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.vertexAttribPointer(
			positionAttributeLocation,
			2,
			gl.FLOAT,
			false,
			0,
			0
		);

		// Draw the full-screen quad
		gl.drawArrays(gl.TRIANGLES, 0, 6);

		callback();
	};
};

const setupGL = (canvas) => {
	const gl = canvas.getContext('webgl');
	if (!gl) {
		console.error('WebGL not supported');
		return;
	}
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = createShader(
		gl,
		gl.FRAGMENT_SHADER,
		fragmentShaderSource
	);
	const program = createProgram(gl, vertexShader, fragmentShader);

	const positionAttributeLocation = gl.getAttribLocation(
		program,
		'a_position'
	);
	const resolutionUniformLocation = gl.getUniformLocation(
		program,
		'u_resolution'
	);
	const timeUniformLocation = gl.getUniformLocation(program, 'u_time');

	// Set up the positions for the full-screen quad
	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	return {
		gl,
		program,
		positionAttributeLocation,
		resolutionUniformLocation,
		timeUniformLocation,
		positionBuffer,
	};
};

const consoleMessage = () => {
	const colors = [
		'#CC3333',
		'#CC6633',
		'#CCCC33',
		'#33CC33',
		'#33CCCC',
		'#3366CC',
		'#6633CC',
	];

	const art = `
    ..   
    .uef^"                 ..          888B. 
  :d88E                   @L          48888E 
  '888E            .u    9888i   .dL  '8888' 
    888E .z8k    ud8888.  'Y888k:*888.  Y88F  
    888E~?888L :888'8888.   888E  888I  '88   
    888E  888E d888 '88%"   888E  888I   8F   
    888E  888E 8888.+"      888E  888I   4    
    888E  888E 8888L        888E  888I   .    
    888E  888E '8888c. .+  x888N><888'  u8N.  
   m888N= 888>  "88888%     "88"  888  "*88%  
    'Y"   888     "YP'            88F    ""   
        J88"                    98"          
        @%                    ./"            
      :"                     ~'              
  `;

	console.log(
		art
			.split('\n')
			.map((line, index) => `%c${line}`)
			.join('\n'),
		...art
			.split('\n')
			.map(
				(_, index) =>
					`color: ${colors[index % colors.length]}; font-size: 14px;`
			)
	);
	console.log(
		'%c    👀   U TRYNA HACK MY SYSTEM ?!?!   👀',
		'font-family:sans-serif; color: yellow; font-size: 22px;'
	);
};

const DOMContentLoaded = () => {
	consoleMessage();

	function toggleMenu() {
		const navMenu = document.getElementById('nav-menu');
		navMenu.classList.toggle('active');
	}
	document.querySelector('.hamburger').addEventListener('click', toggleMenu);

	const canvas = document.getElementById('backgroundCanvas');
	canvas.width = Math.max(window.innerWidth / 10, 400);
	canvas.height = Math.max(window.innerHeight / 10, 300);
	const glContext = setupGL(canvas);
	const gl = canvas.getContext('webgl');
	if (gl) {
		const render = getRenderFunction(glContext, () =>
			requestAnimationFrame(render)
		);
		requestAnimationFrame(render);
	}
};

document.addEventListener('DOMContentLoaded', DOMContentLoaded);
