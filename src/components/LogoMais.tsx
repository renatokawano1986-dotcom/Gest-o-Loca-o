import React from "react";

export function LogoMais() {
  return (
    <span 
      className="inline-flex items-center justify-center align-middle ml-1 select-none shrink-0" 
      style={{ verticalAlign: "middle" }}
      id="logo-mais-svg-container"
    >
      <svg 
        className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-[0_3px_6px_rgba(125,211,252,0.55)] shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-90 cursor-pointer" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        id="logo-mais-svg"
      >
        {/* Modern styled square with high rounded corners */}
        <rect width="100" height="100" rx="30" fill="url(#logoPlusGradient)" />
        
        {/* Soft internal gloss gradient overlay */}
        <rect width="100" height="100" rx="30" fill="url(#logoGloss)" opacity="0.15" />
        
        {/* High-fidelity glowing plus sign lines */}
        <path 
          d="M50 20V80M20 50H80" 
          stroke="white" 
          strokeWidth="16" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Central unit home-dot representing property focus */}
        <circle cx="50" cy="50" r="6" fill="#ffffff" className="animate-pulse" />
        
        <defs>
          {/* Stunning, high-contrast gradient from Baby Blue to Avocado Green */}
          <linearGradient id="logoPlusGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7dd3fc" /> {/* Baby Blue (Azul Bebê) */}
            <stop offset="55%" stopColor="#a3e635" /> {/* Avocado Green (Verde Abacate) */}
            <stop offset="100%" stopColor="#84cc16" /> {/* Deep Avocado Accent */}
          </linearGradient>
          
          <linearGradient id="logoGloss" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
