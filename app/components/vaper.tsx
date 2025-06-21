import React, { useEffect, useState } from 'react'

interface VaperProps {
  color?: string
  duration?: number
  particleCount?: number
  className?: string
  isActive?: boolean
  type?: 'rounded' | 'square'
}

interface Particle {
  id: number
  duration: number
  startX: number
  endX: number
  size: number
  type: 'rounded' | 'square'
}

export function Vaper({
  color = '#ffffff',
  duration = 3,
  particleCount = 8,
  className = '',
  isActive = true,
  type = 'square',
}: VaperProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      duration: duration + Math.random() * 2,
      startX: Math.random() * 100,
      endX: Math.random() * 100,
      size: 20 + Math.random() * 40,
      type,
    }))
    setParticles(newParticles)
  }, [particleCount, duration])

  return (
    <div className={`relative ${className}`}>
      {isActive &&
        particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute ${
              type === 'rounded' ? 'rounded-full' : 'rounded-sm'
            } opacity-90 animate-pulse`}
            style={
              {
                backgroundColor: color,
                left: `calc(${particle.startX}% - ${particle.size * 1.5}px)`,
                bottom: `${particle.size}%`,
                width: `${particle.size}px`,
                height: `${particle.size * 1.2}px`,
                filter: 'blur(4px)',
                animation: `smokeRise ${particle.duration}s infinite ease-in-out`,
                '--start-x': `${particle.startX}%`,
                '--end-x': `${particle.endX}%`,
              } as React.CSSProperties
            }
          />
        ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes smokeRise {
            0% {
              transform: translateY(0) translateX(0) scale(0.3) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: 0.8;
            }
            50% {
              transform: translateY(-100px) translateX(${
                Math.random() * 60 - 30
              }px) scale(0.8) rotate(180deg);
              opacity: 0.6;
            }
            85% {
              opacity: 0.3;
            }
            100% {
              transform: translateY(-200px) translateX(${
                Math.random() * 120 - 60
              }px) scale(1.2) rotate(360deg);
              opacity: 0;
            }
          }
        `,
        }}
      />
    </div>
  )
}
