document.addEventListener('DOMContentLoaded', function () {
    // Cibler toutes les balises <img>
    const images = document.querySelectorAll('img');

    // Fonction asynchrone pour charger une image
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

    // Fonction principale pour traiter chaque image
    async function processImages() {
        for (const img of images) {
            await loadImage(img);

            // Obtenir les dimensions de l'image
            const width = img.width;
            const height = img.height;
            const src = img.src;

            // Créer un élément <canvas> de la même taille
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            // Remplacer l'image par le canvas
            img.parentNode.replaceChild(canvas, img);

            // Initialiser le renderer de Three.js
            const renderer = new THREE.WebGLRenderer({ canvas: canvas });
            renderer.setSize(width, height);

            // Créer une scène
            const scene = new THREE.Scene();

            // Créer une caméra orthographique
            const aspect = width / height;
            const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
            camera.position.z = 1;

            // Ajouter une lumière à la scène
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(0, 0, 1).normalize();
            scene.add(light);

            // Charger la texture de l'image
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(src, function (texture) {
                // Créer un matériau utilisant la texture
                const material = new THREE.MeshBasicMaterial({ map: texture });

                // Créer une géométrie de plan de la même taille que le canvas
                const geometry = new THREE.PlaneGeometry(2 * aspect, 2);

                // Créer le mesh
                const mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);

                // Créer une texture aléatoire en utilisant les dimensions de l'image
                const size = width * height;
                const data = new Uint8Array(4 * size);
                for (let i = 0; i < size; i++) {
                    const stride = i * 4;
                    let r = Math.random() * 255;
                    let g = Math.random() * 255;

                    data[stride] = r; // red
                    data[stride + 1] = g; // green
                    data[stride + 2] = 150; // blue, fixe pour une couleur visible
                    data[stride + 3] = 255; // alpha
                }
                const randomTexture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
                randomTexture.needsUpdate = true;

                // Utiliser une nouvelle géométrie pour le randomMesh
                const randomGeometry = new THREE.PlaneGeometry(2 * aspect, 2);
                const randomMaterial = new THREE.MeshBasicMaterial({ map: randomTexture, transparent: true, opacity: 0.5 });
                const randomMesh = new THREE.Mesh(randomGeometry, randomMaterial);
                scene.add(randomMesh);

                // Rendre la scène avec les deux textures
                renderer.render(scene, camera);
            });
        }
    }

    // Appeler la fonction principale
    processImages();
});
