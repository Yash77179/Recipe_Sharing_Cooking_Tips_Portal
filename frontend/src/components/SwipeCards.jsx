import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from "framer-motion";
import './SwipeCards.css';

const SwipeCards = () => {
  const [cards, setCards] = useState(cardData);

  return (
    <div className="swipe-section-wrapper">
      {/* Section Header */}
      <div className="swipe-section-header">
        <span className="script-sub">Explore & Discover</span>
        <h2 className="section-title-no-line section-title-smaller">Swipe Through Deliciousness</h2>
      </div>

      {/* Cards Wrapper with Navigation */}
      <div className="swipe-cards-wrapper">
        {/* Left Visual Indicator */}
        {cards.length > 0 && (
          <div className="swipe-indicator swipe-indicator-left">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </div>
        )}

        {/* Cards Container */}
        <div className="swipe-cards-container">
          {cards.length === 0 ? (
            <div className="swipe-empty-state">
              <button
                className="swipe-reset-btn"
                onClick={() => setCards(cardData)}
              >
                Reset
              </button>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {cards.map((card, index) => {
                  const indexFromFront = cards.length - 1 - index;
                  // Only render top 3 cards to prevent "crumbling" mess
                  if (indexFromFront > 2) return null;

                  return (
                    <Card
                      key={card.id}
                      cards={cards}
                      setCards={setCards}
                      isFront={index === cards.length - 1}
                      indexFromFront={indexFromFront}
                      {...card}
                    />
                  );
                })}
              </AnimatePresence>
              {/* Hover Hint */}
              <div className="swipe-hint">
                <span className="swipe-hint-text">← Swipe Me →</span>
                <span className="swipe-hint-subtext">Drag to discover more</span>
              </div>
            </>
          )}
        </div>

        {/* Right Visual Indicator */}
        {cards.length > 0 && (
          <div className="swipe-indicator swipe-indicator-right">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        )}
      </div>
    </div >
  );
};

const Card = ({ id, url, setCards, cards, isFront, indexFromFront }) => {
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);

  const rotateRaw = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  const rotate = useTransform(() => {
    // If dragging front card, use the dynamic rotation
    if (isFront) return `${rotateRaw.get()}deg`;

    // Background cards: Straight stack (no rotation)
    return "0deg";
  });

  const handleDragEnd = (event, info) => {
    const xValue = x.get();
    const threshold = 75; // Lower threshold for easier swiping on mobile

    if (Math.abs(xValue) > threshold) {
      // Card swiped away
      setCards((pv) => pv.filter((v) => v.id !== id));
    } else {
      // Reset card position if not swiped far enough
      x.set(0);
    }
  };

  return (
    <motion.img
      src={url}
      alt="Swipeable card"
      className="swipe-card"
      style={{
        gridRow: 1,
        gridColumn: 1,
        x,
        opacity,
        rotate,
        background: "white",
        objectFit: "cover",
        zIndex: 100 - indexFromFront,
        boxShadow: isFront
          ? "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)"
          : undefined,
        touchAction: isFront ? "none" : "auto", // Prevent scroll on front card
      }}
      animate={{
        scale: 1 - indexFromFront * 0.05,
        y: -indexFromFront * 15,
        opacity: 1,
        x: 0,
      }}
      initial={{
        scale: 0.8,
        opacity: 0,
        y: -indexFromFront * 15
      }}
      exit={{
        x: x.get() < 0 ? -300 : 300,
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.3 }
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragSnapToOrigin={false}
      whileDrag={{
        cursor: "grabbing",
        scale: 1.05
      }}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => isFront && setIsHovered(true)}
      onMouseLeave={() => isFront && setIsHovered(false)}
    />
  );
};

export default SwipeCards;

const cardData = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=400&h=600&auto=format&fit=crop",
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=400&h=600&auto=format&fit=crop",
  },
];
