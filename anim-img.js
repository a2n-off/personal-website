document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('img');

    function loadImage(img) {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Gérer les erreurs de chargement
            }
        });
    }

    function clamp(number, min, max) {
        return Math.max(min, Math.min(number, max));
    }

    async function processImages() {
        for (const img of images) {
            await loadImage(img);

            // get the img h & w and calculate the aspect
            const imgWidth = img.width;
            const imgHeight = img.height;
            const imgAspect = imgWidth / imgHeight;
            const imgSrc = img.src;

            // create a canvas w/ the same size of the img
            const canvas = document.createElement('canvas');
            canvas.width = imgWidth;
            canvas.height = imgHeight;

            // replace the img by the canva
            img.parentNode.replaceChild(canvas, img);

            // init the rendering of three.js
            const renderer = new THREE.WebGLRenderer({ canvas: canvas });
            renderer.setSize(imgWidth, imgHeight);

            // init scene, camera and light
            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-imgAspect, imgAspect, 1, -1, 0.1, 10);
            camera.position.z = 1;
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0, 0, 1).normalize();
            scene.add(light);

            // load the img texture
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(imgSrc, function (imgTexture) {
                // create a material from the img
                const imgMaterial = new THREE.MeshBasicMaterial({ map: imgTexture });

                // create a plane geometry of the same size has the canva
                const geometry = new THREE.PlaneGeometry(2 * imgAspect, 2);

                // create mesh and add it to the scene
                const mesh = new THREE.Mesh(geometry, imgMaterial);
                scene.add(mesh);

                // Variables for grid and mouse interaction
                let gridTexture;
                let mouse = { x: 0, y: 0, vX: 0, vY: 0 };
                let prevMouse = { x: 0, y: 0 };

                const settings = {
                    relaxation: 0.9,
                    mouse: 0.25,
                    strength: 0.11,
                    size: 50
                };

                /**
                 * generate the grid texture (dataTexture) in function of the parameter
                 */
                function generateGrid() {
                    const size = settings.size * settings.size;
                    const data = new Float32Array(4 * size);

                    for (let i = 0; i < size; i++) {
                        const stride = i * 4;
                        let r = Math.random() * 255 - 125;
                        let r1 = Math.random() * 255 - 125;

                        data[stride] = r; // red, and also X
                        data[stride + 1] = r1; // green, and also Y
                        data[stride + 2] = 0; // blue
                    }

                    gridTexture = new THREE.DataTexture(data, settings.size, settings.size, THREE.RGBAFormat, THREE.FloatType);
                    gridTexture.needsUpdate = true;
                }

                /**
                 * generate the grid texture and add the texture to the scene
                 */
                function addObjects() {
                    generateGrid();
                    imgTexture.needsUpdate = true;
                    const vertexShader = document.getElementById('vertexShader').textContent;
                    const fragmentShader = document.getElementById('fragmentShader').textContent;

                    const randomMaterial = new THREE.ShaderMaterial({
                        extensions: {
                            derivatives: "#extension GL_OES_standard_derivatives : enable"
                        },
                        side: THREE.DoubleSide,
                        uniforms: {
                            time: {
                                value: 0
                            },
                            resolution: {
                                value: new THREE.Vector4(1, 1, 1, 1)
                            },
                            uTexture: {
                                value: imgTexture
                            },
                            uDataTexture: {
                                value: gridTexture
                            },
                        },
                        vertexShader,
                        fragmentShader
                    });
                    const randomGeometry = new THREE.PlaneGeometry(2 * imgAspect, 2);
                    //const randomGeometry = new THREE.PlaneGeometry(1);
                    const randomMesh = new THREE.Mesh(randomGeometry, randomMaterial);
                    scene.add(randomMesh);
                }

                /**
                 * update the texture in fc of the mouse movement
                 */
                function updateDataTexture() {
                    let data = gridTexture.image.data;

                    for (let i = 0; i < data.length; i += 4) {
                        data[i] *= settings.relaxation;
                        data[i + 1] *= settings.relaxation;
                    }

                    let gridMouseX = settings.size * mouse.x;
                    let gridMouseY = settings.size * (1 - mouse.y);
                    let maxDist = settings.size * settings.mouse;
                    let aspect = imgHeight / imgWidth;

                    for (let i = 0; i < settings.size; i++) {
                        for (let j = 0; j < settings.size; j++) {

                            let distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;
                            let maxDistSq = maxDist ** 2;

                            if (distance < maxDistSq) {

                                let index = 4 * (i + settings.size * j);

                                let power = maxDist / Math.sqrt(distance);
                                power = clamp(power, 0, 10);

                                data[index] += settings.strength * 100 * mouse.vX * power;
                                data[index + 1] -= settings.strength * 100 * mouse.vY * power;
                            }
                        }
                    }

                    mouse.vX *= 0.9;
                    mouse.vY *= 0.9;
                    gridTexture.needsUpdate = true;
                }

                /**
                 * render all the stuff
                 */
                function render() {
                    updateDataTexture();
                    renderer.render(scene, camera);
                    requestAnimationFrame(render);
                }

                /**
                 * update the coordinate of the mouse for is position into the canvas
                 * @param event
                 */
                function updateMousePosition(event) {
                    const rect = canvas.getBoundingClientRect();
                    mouse.x = (event.clientX - rect.left) / imgWidth;
                    mouse.y = (event.clientY - rect.top) / imgHeight;

                    mouse.vX = mouse.x - prevMouse.x;
                    mouse.vY = mouse.y - prevMouse.y;

                    prevMouse.x = mouse.x;
                    prevMouse.y = mouse.y;
                }

                canvas.addEventListener('mousemove', event => {
                    updateMousePosition(event);
                });

                /**
                 * first add the object then render it
                 */
                addObjects();
                render();
            });
        }
    }

    processImages();
});