import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import "./TextParallaxContent.css";

export const JourneyParallax = () => {
    return (
        <div className="bg-white">
            <TextParallaxContent
                imgUrl="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2832&auto=format&fit=crop"
                subheading="Connect"
                heading="A Global Community"
            >
                <ConnectContent />
            </TextParallaxContent>
            <TextParallaxContent
                imgUrl="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=2830&auto=format&fit=crop"
                subheading="Taste"
                heading="Culinary Excellence"
            >
                <QualityContent />
            </TextParallaxContent>
            <TextParallaxContent
                imgUrl="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop"
                subheading="Learn"
                heading="Master Your Craft"
            >
                <LearnContent />
            </TextParallaxContent>
        </div>
    );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
    return (
        <div className="tpc-wrapper">
            <div className="tpc-container">
                <StickyImage imgUrl={imgUrl} />
                <OverlayCopy heading={heading} subheading={subheading} />
            </div>
            {children}
        </div>
    );
};

const StickyImage = ({ imgUrl }) => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["end end", "end start"],
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

    return (
        <motion.div
            style={{
                backgroundImage: `url(${imgUrl})`,
                scale,
            }}
            ref={targetRef}
            className="tpc-sticky-image"
        >
            <motion.div
                className="tpc-overlay"
                style={{
                    opacity,
                }}
            />
        </motion.div>
    );
};

const OverlayCopy = ({ subheading, heading }) => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
    const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

    return (
        <motion.div
            style={{
                y,
                opacity,
            }}
            ref={targetRef}
            className="tpc-overlay-copy"
        >
            <p className="tpc-subheading">
                {subheading}
            </p>
            <p className="tpc-heading">{heading}</p>
        </motion.div>
    );
};

/* --- Content Components --- */

const ConnectContent = () => (
    <div className="tpc-content-grid">
        <h2 className="tpc-content-heading">
            Share Your Passion with the World
        </h2>
        <div className="tpc-content-body">
            <p className="tpc-paragraph">
                Food is the universal language. Our platform connects you with home cooks and professional chefs from every corner of the globe. Share your heritage, discover new flavors, and make lasting connections.
            </p>
            <p className="tpc-paragraph">
                Whether you're hosting a virtual dinner party or swapping secret family recipes, you'll find your tribe here.
            </p>
            <button className="tpc-btn">
                Join the Community <FiArrowUpRight />
            </button>
        </div>
    </div>
);

const QualityContent = () => (
    <div className="tpc-content-grid">
        <h2 className="tpc-content-heading">
            Curated Recipes, Tested for Perfection
        </h2>
        <div className="tpc-content-body">
            <p className="tpc-paragraph">
                We believe in quality over quantity. Every recipe on our platform is curated and tested to ensure success in your kitchen. No more guessing games—just delicious results.
            </p>
            <p className="tpc-paragraph">
                From quick weeknight dinners to elaborate holiday feasts, access a library of recipes that inspire and delight.
            </p>
            <button className="tpc-btn">
                Browse Recipes <FiArrowUpRight />
            </button>
        </div>
    </div>
);

const LearnContent = () => (
    <div className="tpc-content-grid">
        <h2 className="tpc-content-heading">
            Elevate Your Skills Daily
        </h2>
        <div className="tpc-content-body">
            <p className="tpc-paragraph">
                Cooking is a journey of continuous learning. Access expert-led tutorials, technique guides, and ingredient deep-dives designed to transform you into a confident chef.
            </p>
            <p className="tpc-paragraph">
                Master the art of plating, learn the science of baking, or perfect your knife skills. The kitchen is your classroom.
            </p>
            <button className="tpc-btn">
                Start Learning <FiArrowUpRight />
            </button>
        </div>
    </div>
);

export default JourneyParallax;
