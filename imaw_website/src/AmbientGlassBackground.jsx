import React, { useEffect, useRef } from 'react';

export default function AmbientGlassBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Wait for regl to be available globally from CDN
    if (!window.createREGL) {
      console.error("regl.js is not loaded");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const regl = window.createREGL({ canvas });

    // A simple shader drawing glowing, slowly moving orbs
    const drawAmbientGlow = regl({
      frag: `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;

        // Function to create a soft, glowing circle
        float circle(vec2 uv, vec2 pos, float radius, float softness) {
          float d = length(uv - pos);
          // Smoothstep creates soft, blurry edges like a glowing light
          return smoothstep(radius, radius - softness, d);
        }

        void main() {
          // Normalize coordinates (0 to 1) and account for aspect ratio
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          uv.x *= resolution.x / resolution.y;

          // Background base color (very dark violet/charcoal)
          vec3 color = vec3(0.06, 0.07, 0.09);

          // Orb 1: Deep Orange, moving in a slow vertical ellipse
          vec2 pos1 = vec2(
            (resolution.x / resolution.y) * 0.5 + sin(time * 0.2) * 0.3,
            0.5 + cos(time * 0.3) * 0.4
          );
          float glow1 = circle(uv, pos1, 0.6, 0.8);
          // Additive blending for the orange light
          color += vec3(0.9, 0.4, 0.1) * glow1 * 0.6;

          // Orb 2: Soft Violet/Blue, drifting horizontally
          vec2 pos2 = vec2(
            (resolution.x / resolution.y) * 0.5 + cos(time * 0.15) * 0.6,
            0.5 + sin(time * 0.25) * 0.3
          );
          float glow2 = circle(uv, pos2, 0.7, 0.9);
          // Additive blending for the violet light
          color += vec3(0.3, 0.2, 0.8) * glow2 * 0.5;

          // Orb 3: Subtle Emerald/Teal, moving in a tight circle
          vec2 pos3 = vec2(
            (resolution.x / resolution.y) * 0.4 + sin(time * 0.4) * 0.2,
            0.6 + cos(time * 0.4) * 0.2
          );
          float glow3 = circle(uv, pos3, 0.5, 0.7);
          color += vec3(0.1, 0.6, 0.4) * glow3 * 0.4;

          gl_FragColor = vec4(color, 1.0);
        }
      `,

      vert: `
        precision mediump float;
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0, 1);
        }
      `,

      attributes: {
        // A single full-screen triangle
        position: [
          -2, 0,
          0, -2,
          2, 2
        ]
      },

      uniforms: {
        time: regl.context('time'),
        resolution: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight]
      },

      count: 3
    });

    // Start the render loop
    const frame = regl.frame(() => {
      regl.clear({
        color: [0, 0, 0, 1],
        depth: 1
      });
      drawAmbientGlow();
    });

    // Cleanup on unmount
    return () => {
      frame.cancel();
      regl.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0f1219]">
      {/* 
        LAYER 1: The WebGL Canvas 
      */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* 
        LAYER 2: The CSS Frosted Glass Overlay
      */}
      <div 
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(80px)',
          WebkitBackdropFilter: 'blur(80px)',
          backgroundColor: 'rgba(15, 18, 25, 0.4)', // Slightly more transparent
        }}
      />
      
      {/* 
        OPTIONAL LAYER 3: Film grain texture
      */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
        }}
      />
    </div>
  );
}
