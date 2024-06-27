document.addEventListener("DOMContentLoaded", () => {

    function getElementDimensions(event) {
        const element = event.target;
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const x = rect.left + scrollLeft;
        const y = rect.top + scrollTop;
        const width = rect.width;
        const height = rect.height;
        return {
            x: x,
            y: y,
            w: width,
            h: height
        };
    }

    function drawHtmlSquare(x, y, color = 'red', size = 10) {
        const square = document.createElement('div');
        square.style.width = `${size}px`;
        square.style.height = `${size}px`;
        square.style.backgroundColor = color;
        square.style.position = 'absolute';
        square.style.left = `${x}px`;
        square.style.top = `${y}px`;
        square.style.zIndex = '999';
        document.body.appendChild(square);
    }

    function drawThreeJsSquare(scene, x, y, z = 0, color = 'red') {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(x, y, z);
        scene.add(square);
    }

    function convertWorldToScreenPoint(xWorld, yWorld, canvasWidth, canvasHeight, projection) {
        // Matrice 3x3 de projection
        const m00 = projection[0], m01 = projection[1], m02 = projection[2];
        const m10 = projection[3], m11 = projection[4], m12 = projection[5];
        const m20 = projection[6], m21 = projection[7], m22 = projection[8];

        // Transformation du point du monde aux coordonnées homogènes de l'espace écran (clip space)
        const clipX = m00 * xWorld + m01 * yWorld + m02;
        const clipY = m10 * xWorld + m11 * yWorld + m12;
        const clipW = m20 * xWorld + m21 * yWorld + m22;

        // Normalisation des coordonnées homogènes
        const ndcX = clipX / clipW;
        const ndcY = clipY / clipW;

        // Conversion des coordonnées NDC (Normalized Device Coordinates) aux coordonnées d'écran
        const screenX = (1.0 + ndcX) * canvasWidth / 2.0;
        const screenY = (1.0 - ndcY) * canvasHeight / 2.0;

        return [Math.round(screenX), Math.round(screenY)];
    }

    function getProjection(canvasWidth, canvasHeight) {
        // Créer une matrice 3x3 pour la projection
        const projection = [
            2 / canvasWidth, 0, 0,
            0, -2 / canvasHeight, 0,
            -1, 1, 1
        ];
        return projection;
    }

    document.querySelectorAll(".easterEgg").forEach((element) => {
        element.addEventListener("click", (event) => {
            startEmojiFountain(event);
        });
    });

    function createEmojiTexture(emoji) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 64;
        canvas.height = 64;
        context.font = "48px serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(emoji, canvas.width / 2, canvas.height / 2);
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    function startEmojiFountain(event) {
        const emoji = event.currentTarget.getAttribute("emoji");

        const container = document.createElement("div");
        container.classList.add("emoji-container");
        container.style.position = "fixed";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.top = "0px";
        container.style.left = "0px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            -window.innerHeight / 2,
            0.1, 1000
        );
        camera.position.z = 1;
        camera.lookAt(new THREE.Vector3(0,0,0));

        const elem = getElementDimensions(event);
        const pixelX = event.offsetX + elem.x;
        const pixelY = event.offsetY + elem.y;

        // debug
        console.log('real coord', pixelX, pixelY);
        drawHtmlSquare(pixelX, pixelY);

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const emojis = [];
        const emojiTexture = createEmojiTexture(emoji);
        const emojiGeometry = new THREE.PlaneGeometry(40, 40);
        const emojiMaterial = new THREE.MeshBasicMaterial({
            map: emojiTexture,
            transparent: true,
        });

        const vec = new THREE.Vector3(pixelX, pixelY, -1);
        const proj = new THREE.Vector3(pixelX, pixelY, -1).project(camera);
        const unproj = new THREE.Vector3(pixelX, pixelY, -1).unproject(camera);
        const calcx = pixelX / (window.innerHeight / 2) - 1;
        const calcy = - pixelY / (window.innerWidth / 2) + 1;
        const cvec = new THREE.Vector3(calcx, calcy, -1);
        const cproj = new THREE.Vector3(calcx, calcy, -1).project(camera);
        const cunproj = new THREE.Vector3(calcx, calcy, -1).unproject(camera);
        console.log('vec', vec)
        console.log('proj', proj)
        console.log('unproj', unproj)
        console.log('calc', { calcx, calcy })
        console.log('cvec', cvec)
        console.log('cproj', cproj)
        console.log('cunproj', cunproj)

        for (let i = 0; i < 50; i++) {
            const emojiMesh = new THREE.Mesh(emojiGeometry, emojiMaterial);
            emojiMesh.position.set(cunproj.x, cunproj.y, -1);
            emojiMesh.userData.velocityX = Math.random() * 0.4 - 0.2;
            emojiMesh.userData.velocityY = Math.random() * 0.8 + 0.4;
            scene.add(emojiMesh);
            emojis.push(emojiMesh);
        }

        let functionExecutionId = 0;
        let animId = 0;

        function animate() {
            const executionId = ++functionExecutionId;
            //console.log(`animate ${executionId}`)
            let stillAnimating = false;
            emojis.forEach((emoji) => {
                // emoji.position.y += emoji.userData.velocityY;
                // emoji.position.x += emoji.userData.velocityX;
                // emoji.userData.velocityY -= 0.1; // gravity effect

                if (emoji.position.y > -window.innerHeight / 50) {
                    stillAnimating = true;
                }
            });

            renderer.render(scene, camera);

            if (stillAnimating) {
                animId = requestAnimationFrame(animate);
                //console.log(animId)
            } else {
                setTimeout(() => {
                    container.remove();
                    window.cancelAnimationFrame(animId);
                }, 10000);
            }
        }

        animate();
    }
});
