"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  size: number;
  color: "red" | "blue";
  duration: number;
  delay: number;
  path: { x: number; y: number }[];
  opacity: number[];
}

export default function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate random particles
    const particleCount = 40;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const initialX = Math.random() * 100;
      const initialY = Math.random() * 100;
      
      // Create a smooth path with 3-4 points
      const pathPoints = [];
      for (let j = 0; j < 4; j++) {
        pathPoints.push({
          x: (Math.random() * 100 - 50) * 2, // Movement range
          y: (Math.random() * 100 - 50) * 2,
        });
      }

      newParticles.push({
        id: i,
        initialX,
        initialY,
        size: Math.random() * 5 + 2, // Size between 2-7px
        color: Math.random() > 0.5 ? "red" : "blue",
        duration: Math.random() * 25 + 20, // Duration between 20-45s
        delay: Math.random() * 3, // Delay between 0-3s
        path: pathPoints,
        opacity: [
          Math.random() * 0.4 + 0.4,
          Math.random() * 0.3 + 0.6,
          Math.random() * 0.3 + 0.5,
          Math.random() * 0.4 + 0.4,
        ],
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => {
        const keyframes = {
          x: particle.path.map((p) => p.x),
          y: particle.path.map((p) => p.y),
          opacity: particle.opacity,
        };

        return (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${
              particle.color === "red"
                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9),0_0_16px_rgba(239,68,68,0.6),0_0_24px_rgba(239,68,68,0.3)]"
                : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9),0_0_16px_rgba(59,130,246,0.6),0_0_24px_rgba(59,130,246,0.3)]"
            }`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
            }}
            animate={keyframes}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

