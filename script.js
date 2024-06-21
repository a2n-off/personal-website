document.addEventListener('DOMContentLoaded', function() {
    /* LENIS */
    const lenis = new Lenis({
        duration: 1.2, // Customize the duration of the scroll animation
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function
        direction: 'vertical', // Scroll direction
        gestureDirection: 'vertical', // Gesture direction
        smooth: true, // Enable smooth scroll
    });

    function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    /* GSAP */
    gsap.registerPlugin(ScrollTrigger,Draggable,TextPlugin);

    /* loader */
    lenis.stop();

    // animation
    const loader = document.getElementById('loader');
    const gridLoader = document.getElementById('grid-loader');
    const nbOfCol = window.getComputedStyle(gridLoader).getPropertyValue('grid-template-columns').split(' ').length;
    const listOfCol = [];

    /* add the col and animate the entrance */
    for (let i = 0; i < nbOfCol; i++) {
        const loaderCol = document.createElement('div');
        loaderCol.classList.add('loader-col');
        loaderCol.classList.add(`c${i}`);
        const newChildRef = gridLoader.appendChild(loaderCol);
        listOfCol.push(newChildRef);
        setTimeout(() => {
            newChildRef.classList.add('loaded');
        }, i*300)
    }

    /* pass all the col to dotted style */
    for (let i = 0; i < listOfCol.length; i++) {
        setTimeout(() => {
            listOfCol[i].style.borderStyle = 'dotted';
        }, nbOfCol*300)
    }

    // add Alan Bouteiller each letter one by one in sec-color
    // fade the background - pri-color to sec-color
    // at the same time fade the border color - sec-color to pri-color
    // at the same time fade the text color - sec-color to pri-color

    lenis.start();

    function getTotalHeight(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const styles = window.getComputedStyle(element);
            const margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);
            const height = element.offsetHeight;
            return height + margin;
        }
        return 0;
    }

    // Smooth scroll to anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navTotalHeight = getTotalHeight('nav');
                const offsetTop = target.getBoundingClientRect().top + window.scrollY - navTotalHeight;
                lenis.scrollTo(offsetTop);
            }
        });
    });

    /* CURSOR EFFECT */
    const circle = document.createElement('div');
    circle.id = 'cursor-circle';
    document.body.appendChild(circle);

    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;
    const speed = 0.08; // latency

    function updateMousePosition(e) {
        if (e.type === 'scroll') {
            return; // TODO make the circle follow the mouse on scroll
        }
        mouseY = e.pageY;
        mouseX = e.pageX;
    }

    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('scroll', updateMousePosition);

    function animate() {
        circleX += (mouseX - circleX) * speed;
        circleY += (mouseY - circleY) * speed;

        circle.style.left = circleX + 'px';
        circle.style.top = circleY + 'px';

        requestAnimationFrame(animate);
    }

    animate();

    function applyLinkEffect(elem) {
        elem.addEventListener('mouseover', () => {
            elem.classList.add('hovered');
            circle.style.width = '20px';
            circle.style.height = '20px';
            circle.style.borderColor = 'var(--mouse-color)';
        });
        elem.addEventListener('mouseout', () => {
            elem.classList.remove('hovered');
            circle.style.width = '30px';
            circle.style.height = '30px';
            circle.style.borderColor = 'var(--pri-color)';
        });
    }

    const links = document.querySelectorAll('a');
    links.forEach(link => {
        applyLinkEffect(link);
    });

    /* TOOLTIPS */
    const emailElement = document.getElementById('email');
    const tooltip = document.createElement('div');
    const tooltipText = document.createElement('p');

    tooltip.id = 'tooltip';
    tooltipText.textContent = 'click to copy';
    tooltip.appendChild(tooltipText);
    document.body.appendChild(tooltip);

    applyLinkEffect(emailElement);

    emailElement.addEventListener('mouseenter', function () {
        tooltip.style.display = 'flex';
    });

    emailElement.addEventListener('mouseleave', function () {
        tooltip.style.display = 'none';
    });

    emailElement.addEventListener('mousemove', function (e) {
        tooltip.style.left = e.pageX + 10 + 'px'; // 10 pixels to the right of the cursor
        tooltip.style.top = e.pageY - tooltip.offsetHeight - 10 + 'px'; // 10 pixels above the cursor
    });

    emailElement.addEventListener('click', function () {
        navigator.clipboard.writeText(emailElement.getAttribute('toCopy').toLowerCase().trim())
        tooltip.textContent = 'copied!';
        setTimeout(() => {
            tooltip.textContent = 'click to copy';
        }, 1000);
    });
});
