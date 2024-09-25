// Wait for the page to load
window.onload = function() {
    // Get the canvas element
    const canvas = document.getElementById('glCanvas');
    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment shader program
    let fragColor = 'vec4(1.0, 0.0, 0.0, 1.0)';
    let fsSource = `
        void main() {
            gl_FragColor= ${fragColor};
        }
    `;

    // Initialize a shader program
    let shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Get the attribute location
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');

    // Create a buffer for the rectangle's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operations to from here out
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create an array of positions for the rectangle.
    const positions = [
        -0.7,  0.5,
         0.7,  0.5,
        -0.7, -0.5,
         0.7, -0.5,
    ];

    // Pass the list of positions into WebGL to build the shape
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    

    function render(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(shaderProgram)
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }

    function updateColor(color){
        fragColor = color;
        const newFsSource = `
            void main() {
                gl_FragColor= ${fragColor};
            }
        `;

        const newShaderProgram = initShaderProgram(gl, vsSource, newFsSource);
        if(newShaderProgram){
            gl.deleteProgram(shaderProgram);
            shaderProgram = newShaderProgram;
            render();
        }
    }

    document.getElementById('blueColor').onclick = () => updateColor('vec4(0.0, 0.0, 1.0, 1.0)');
    document.getElementById('yellowColor').onclick = () => updateColor('vec4(1.0, 1.0, 0.0, 1.0)');
    document.getElementById('greenColor').onclick = () => updateColor('vec4(0.0, 1.0, 0.0, 1.0)');
    document.getElementById('resetColor').onclick = () => updateColor('vec4(1.0, 0.0, 0.0, 1.0)');
    
    render();
}



// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    shaderProgram.fragmentShader = fragmentShader;
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}