document.addEventListener('DOMContentLoaded', function() {

    function loadLenis() {
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

        lenis.scrollTo(0, {immediate: true, force:true}) // on reload the page is at the top

        return lenis;
    }
    const lenis = loadLenis();

    // create main div for the mouse effect
    const circle = document.createElement('div');

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

    function anchorSmoothScroll() {
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
    }
    anchorSmoothScroll();

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

    function cursor() {
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

        const links = document.querySelectorAll('a');
        links.forEach(link => {
            applyLinkEffect(link);
        });
    }
    cursor();

    function tooltips() {
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
    }
    tooltips();

    function loadGSAP() {
        gsap.registerPlugin(ScrollTrigger,Draggable,TextPlugin);
    }
    loadGSAP();

    function animation() {
        // block the scroll
        lenis.stop();

        // define the default duration and delay of all animation
        const baseDelay = 0.1;
        const baseDuration = 0.8;
        const speedDuration = 0.3;

        // get all the elem for the starting animation
        const nav = document.getElementById('nav');
        const loader = document.getElementById('loader');
        const bottom = document.getElementById('bottom');
        const gridLoader = document.getElementById('grid-loader');
        const intro = document.getElementById('intro');
        const name = document.getElementById('name');
        const lastname = document.getElementById('lastname');

        const nbOfCol = window.getComputedStyle(gridLoader).getPropertyValue('grid-template-columns').split(' ').length;

        let tlmain = gsap.timeline();
        let colEntrance = gsap.timeline();

        /* add the col and animate the entrance */
        for (let i = 0; i < nbOfCol; i++) {
            const loaderCol = document.createElement('div');
            loaderCol.classList.add('loader-col');
            loaderCol.classList.add(`c${i}`);
            const newChildRef = gridLoader.appendChild(loaderCol);
            colEntrance.to(newChildRef, {height: '100%', duration: baseDuration}, (baseDelay/2)*i);
        }

        /* setup the text */
        name.innerHTML = name.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
        name.style.zIndex = '1';

        lastname.innerHTML = lastname.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
        lastname.style.zIndex = '1';

        /* animate  the text */
        let nameEntrance = gsap.timeline();
        name.childNodes.forEach((e, i) => {
            if (i === 0) {
                nameEntrance.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: speedDuration, ease: 'expoScale(0.5,7,none)'});
            } else {
                nameEntrance.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: speedDuration, ease: 'expoScale(0.5,7,none)'}, `<${0.03}`);
            }
        })

        let lastnameEntrance = gsap.timeline();
        lastname.childNodes.forEach((e, i) => {
            if (i === 0) {
                lastnameEntrance.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: speedDuration, ease: 'expoScale(0.5,7,none)'});
            } else {
                lastnameEntrance.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: speedDuration, ease: 'expoScale(0.5,7,none)'}, `<${0.03}`);
            }
        })

        /* fade all the elements */
        let loaderFading = gsap.timeline();
        loaderFading.to(loader, {autoAlpha: 0, duration: baseDuration, ease: 'expoScale(0.5,7,none)', onComplete: () => {
                // reset all the main element
                nav.style.zIndex = 2; /* no idea why I need this to have my blur working but since it work ... */
                lenis.start();
                loader.remove();
            }})

        /* animate the rest of the hero block */
        let navEntrance = gsap.timeline();
        navEntrance.to(nav, {autoAlpha: 1, y: 0, stagger: 0.05, duration: baseDuration, ease: 'expoScale(0.5,7,none)'});

        let bottomEntrance = gsap.timeline();
        bottomEntrance.to(bottom, {autoAlpha: 1, y: 0, stagger: 0.05, duration: baseDuration, ease: 'expoScale(0.5,7,none)'});

        let introEntrance = gsap.timeline();
        const introWords = intro.textContent.split(' ');
        intro.innerHTML = introWords.map(word => `<span class='letter'>${word}</span>`).join(' ');
        intro.childNodes.forEach((e, i) => {
            if (i === 0) {
                introEntrance.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: speedDuration, ease: 'expoScale(0.5,7,none)'});
            } else {
                introEntrance.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: speedDuration, ease: 'expoScale(0.5,7,none)'}, `<${0.03}`);
            }
        })

        /* get all the other text to animate */
        const textHC = document.getElementsByClassName('animate-text-hc');
        const titleHC = document.getElementsByClassName('animate-title-hc');

        Array.from(titleHC).forEach((el, i) => {
            el.innerHTML = el.textContent.replace(/\S/g, "<span class='animated-letter'>$&</span>");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    scrub: false,
                    toggleAction: 'play',
                    markers: false
                }
            });
            el.childNodes.forEach((e, i) => {
                if (i === 0) {
                    tl.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: baseDuration, ease: 'expoScale(0.5,7,none)'});
                } else {
                    tl.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: baseDuration, ease: 'expoScale(0.5,7,none)'}, `<${0.03}`);
                }
            })
        })

        Array.from(textHC).forEach((el, i) => {
            const elWords = el.textContent.split(' ');
            el.innerHTML = elWords.map(word => `<span class='animated-word'>${word}</span>`).join(' ');
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    scrub: false,
                    toggleAction: 'play',
                    markers: false
                }
            });
            el.childNodes.forEach((e, i) => {
                if (i === 0) {
                    tl.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: baseDuration, ease: 'expoScale(0.5,7,none)'});
                } else {
                    tl.to(e, {y: 0, stagger: 0.05, autoAlpha: 1, duration: baseDuration, ease: 'expoScale(0.5,7,none)'}, `<${0.03/elWords.length}`);
                }
            })
        })

        /* animate the img */
        const imgs = document.getElementsByClassName('animate-pic');
        Array.from(imgs).forEach((el, i) => {
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    scrub: false,
                    toggleAction: 'play',
                    markers: false
                }
            });
            el.childNodes.forEach((e, i) => {
                tl.to(e, {x: 0, stagger: 0.05, autoAlpha: 1, duration: 0.5, ease: 'expoScale(0.5,7,none)'});
            })
        })

        /* add all the secondary timeline to the main */
        tlmain
            .add(colEntrance,      'seqA')
            .add(nameEntrance,     'seqB')
            .add(lastnameEntrance, 'seqB')
            .add(loaderFading,     'seqC')
            .add(navEntrance,      'seqC')
            .add(bottomEntrance,   'seqC')
            .add(introEntrance,    'seqC')
        ;
    }
    animation();
});
