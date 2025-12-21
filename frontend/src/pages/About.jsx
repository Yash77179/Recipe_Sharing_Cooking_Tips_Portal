import React, { useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import {
    motion,
    useMotionTemplate,
    useScroll,
    useTransform,
} from 'framer-motion';
import { FiArrowRight, FiMapPin, FiCoffee } from 'react-icons/fi'; // Swapped Icon
import JourneyParallax from '../components/TextParallaxContent';
import './About.css';

const SECTION_HEIGHT = 1500;

export const About = () => {
    return (
        <div className="about-page">
            <ReactLenis
                root
                options={{
                    lerp: 0.05,
                }}
            >
                {/* Global Navbar is handled in App.jsx */}
                <Hero />

                <div style={{ marginTop: '50vh', position: 'relative', zIndex: 10 }}>
                    <JourneyParallax />
                </div>
            </ReactLenis >
        </div >
    );
};

const Hero = () => {
    return (
        <div
            style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
            className="about-hero"
        >
            <CenterImage />
            <ParallaxImages />
            <div className="hero-gradient" />
        </div>
    );
};

const CenterImage = () => {
    const { scrollY } = useScroll();

    // Delayed start: Animation begins after 200px of scrolling
    const clip1 = useTransform(scrollY, [200, 1500], [25, 0]);
    const clip2 = useTransform(scrollY, [200, 1500], [75, 100]);

    const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

    const backgroundSize = useTransform(
        scrollY,
        [0, SECTION_HEIGHT + 500],
        ["170%", "100%"]
    );
    const opacity = useTransform(
        scrollY,
        [SECTION_HEIGHT, SECTION_HEIGHT + 500],
        [1, 0]
    );

    return (
        <motion.div
            className="about-sticky-image"
            style={{
                clipPath,
                backgroundSize,
                opacity,
                backgroundImage:
                    "url(https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=1926&auto=format&fit=crop)", // "Fresh Vegetables" from Home Page
            }}
        />
    );
};

const ParallaxImages = () => {
    return (
        <div className="parallax-container">
            {/* Image 1: Left Small - Coffee/Morning */}
            <ParallaxImg
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop"
                alt="Morning Brew"
                start={-200} // Pulled up
                end={-600}
                className="parallax-img img-small pos-1"
            />
            {/* Image 2: Right Medium - Dough Prep */}
            <ParallaxImg
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop"
                alt="Fresh Dough"
                start={-150}
                end={-700}
                className="parallax-img img-medium pos-2"
            />
            {/* Image 3: Left FAST - The "Speeder" */}
            <ParallaxImg
                src="https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200&auto=format&fit=crop"
                alt="Cooking Action"
                start={-100}
                end={-900}
                className="parallax-img img-large pos-3"
            />
            {/* Image 4: Right Small */}
            <ParallaxImg
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=1200&auto=format&fit=crop"
                alt="Chef Plating"
                start={-300} // Significant pull up
                end={-750}
                className="parallax-img img-small pos-4"
            />
            {/* Image 5: Center Medium - Finale */}
            <ParallaxImg
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop"
                alt="Restaurant Atmosphere"
                start={-400} // Earliest start for the last item
                end={-800}
                className="parallax-img img-medium pos-5"
            />
        </div>
    );
};

const ParallaxImg = ({ className, alt, src, start, end }) => {
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: [`${start}px end`, `end ${end * -1}px`],
    });

    const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
    const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);

    const y = useTransform(scrollYProgress, [0, 1], [start, end]);
    const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

    return (
        <motion.img
            src={src}
            alt={alt}
            className={className}
            ref={ref}
            style={{
                transform,
                opacity,
                borderRadius: '16px' // Explicitly requested "border round"
            }}
        />
    );
};

export default About;
