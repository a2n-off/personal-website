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

    function drawRedSquare(x, y) {
        console.log(x, y);
        const square = document.createElement('div');
        square.style.width = '10px';
        square.style.height = '10px';
        square.style.backgroundColor = 'red';
        square.style.position = 'absolute';
        square.style.left = `${x}px`;
        square.style.top = `${y}px`;
        square.style.zIndex = '999';
        document.body.appendChild(square);
    }

    function convertToCenterCoords(grid, x, y) {
        const windowWidth = grid.innerWidth;
        const windowHeight = grid.innerHeight;
        const centerX = x - windowWidth / 2;
        const centerY = y - windowHeight / 2;
        return {
            x: centerX,
            y: centerY
        };
    }

    document.querySelectorAll(".easterEgg").forEach((element) => {
        element.addEventListener("click", (event) => {
            startEmojiFountain(event);
        });
    });

    function startEmojiFountain(event) {
        const emoji = event.currentTarget.getAttribute("emoji");
        const elem = getElementDimensions(event);
        const pointer = new THREE.Vector2();

        drawRedSquare(elem.x, elem.y)

        // Create and style the container dynamically
        const container = document.createElement("div");
        container.id = "emoji-container";
        container.style.position = "fixed";
        container.style.width = "100vw";
        container.style.height = "100vh";
        container.style.top = "0px";
        container.style.left = "0px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);

        // Three.js setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 25;
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        const raycaster = new THREE.Raycaster();
        raycaster.params.Line.threshold = 3;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        });

        const emojis = [];
        const emojiTexture = createEmojiTexture(emoji);
        const emojiGeometry = new THREE.PlaneGeometry(1, 1);
        const emojiMaterial = new THREE.MeshBasicMaterial({
            map: emojiTexture,
            transparent: true,
        });

        // Calculate the initial position
        //const initialX = event.offsetX;
        //const initialY = -event.offsetY;
        const initialX = ( event.offsetX / window.innerWidth ) * 2 - 1;
        const initialY = - ( event.offsetY / window.innerHeight ) * 2 + 1;

        for (let i = 0; i < 50; i++) {
            const emojiMesh = new THREE.Mesh(emojiGeometry, emojiMaterial);
            emojiMesh.position.set(initialX / 50, initialY / 50, 0);
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
                // emoji.userData.velocityY -= 0.01; // gravity effect

                if (emoji.position.y > -window.innerHeight / 50) {
                    stillAnimating = true;
                }
            });

            raycaster.setFromCamera( pointer, camera );

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

    function createEmojiTexture(emoji) {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = 64;
        canvas.height = 64;
        context.font = "48px serif";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(emoji, 32, 32);
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    }
});
