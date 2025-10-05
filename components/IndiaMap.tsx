"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface StateData {
  name: string;
  language: string;
  speakers: string;
  difficulty: string;
}

// Data based on Indian Census 2011 and Ethnologue
const stateLanguageData: Record<string, StateData> = {
  INAN: { name: "Andaman & Nicobar", language: "Bengali", speakers: "~0.1 Million", difficulty: "Category III: Hard" },
  INAP: { name: "Andhra Pradesh", language: "Telugu", speakers: "~81 Million", difficulty: "Category III: Hard" },
  INAR: { name: "Arunachal Pradesh", language: "Nishi, Adi", speakers: "~1.4 Million", difficulty: "Category III: Hard" },
  INAS: { name: "Assam", language: "Assamese", speakers: "~15 Million", difficulty: "Category III: Hard" },
  INBR: { name: "Bihar", language: "Hindi (Bhojpuri, Magahi)", speakers: "~100 Million", difficulty: "Category III: Hard" },
  INCH: { name: "Chandigarh", language: "Punjabi", speakers: "~1.1 Million", difficulty: "Category III: Hard" },
  INCT: { name: "Chhattisgarh", language: "Hindi (Chhattisgarhi)", speakers: "~26 Million", difficulty: "Category III: Hard" },
  INDH: { name: "Dadra & Nagar Haveli and Daman & Diu", language: "Gujarati", speakers: "~0.6 Million", difficulty: "Category III: Hard" },
  INDL: { name: "Delhi", language: "Hindi", speakers: "~16 Million", difficulty: "Category III: Hard" },
  INGA: { name: "Goa", language: "Konkani", speakers: "~2.2 Million", difficulty: "Category III: Hard" },
  INGJ: { name: "Gujarat", language: "Gujarati", speakers: "~55 Million", difficulty: "Category III: Hard" },
  INHR: { name: "Haryana", language: "Hindi (Haryanvi)", speakers: "~25 Million", difficulty: "Category III: Hard" },
  INHP: { name: "Himachal Pradesh", language: "Hindi (Pahari)", speakers: "~6.5 Million", difficulty: "Category III: Hard" },
  INJH: { name: "Jharkhand", language: "Hindi (Santhali)", speakers: "~33 Million", difficulty: "Category III: Hard" },
  INJK: { name: "Jammu and Kashmir", language: "Kashmiri, Dogri", speakers: "~7 Million", difficulty: "Category III: Hard" },
  INKA: { name: "Karnataka", language: "Kannada", speakers: "~44 Million", difficulty: "Category III: Hard" },
  INKL: { name: "Kerala", language: "Malayalam", speakers: "~38 Million", difficulty: "Category III: Hard" },
  INLA: { name: "Ladakh", language: "Ladakhi", speakers: "~0.3 Million", difficulty: "Category III: Hard" },
  INLD: { name: "Lakshadweep", language: "Malayalam", speakers: "~64,000", difficulty: "Category III: Hard" },
  INMH: { name: "Maharashtra", language: "Marathi", speakers: "~83 Million", difficulty: "Category III: Hard" },
  INML: { name: "Meghalaya", language: "Khasi, Garo", speakers: "~3 Million", difficulty: "Category III: Hard" },
  INMN: { name: "Manipur", language: "Manipuri (Meitei)", speakers: "~1.8 Million", difficulty: "Category III: Hard" },
  INMP: { name: "Madhya Pradesh", language: "Hindi", speakers: "~75 Million", difficulty: "Category III: Hard" },
  INMZ: { name: "Mizoram", language: "Mizo", speakers: "~1.1 Million", difficulty: "Category III: Hard" },
  INNL: { name: "Nagaland", language: "Naga languages", speakers: "~2 Million", difficulty: "Category III: Hard" },
  INOR: { name: "Odisha", language: "Odia", speakers: "~37 Million", difficulty: "Category III: Hard" },
  INPB: { name: "Punjab", language: "Punjabi", speakers: "~30 Million", difficulty: "Category III: Hard" },
  INPY: { name: "Puducherry", language: "Tamil", speakers: "~1.2 Million", difficulty: "Category III: Hard" },
  INRJ: { name: "Rajasthan", language: "Hindi (Rajasthani)", speakers: "~50 Million", difficulty: "Category III: Hard" },
  INSK: { name: "Sikkim", language: "Nepali", speakers: "~0.6 Million", difficulty: "Category III: Hard" },
  INTG: { name: "Telangana", language: "Telugu", speakers: "~35 Million", difficulty: "Category III: Hard" },
  INTN: { name: "Tamil Nadu", language: "Tamil", speakers: "~75 Million", difficulty: "Category III: Hard" },
  INTR: { name: "Tripura", language: "Bengali, Kokborok", speakers: "~3.7 Million", difficulty: "Category III: Hard" },
  INUP: { name: "Uttar Pradesh", language: "Hindi", speakers: "~200 Million", difficulty: "Category III: Hard" },
  INUT: { name: "Uttarakhand", language: "Hindi (Pahari)", speakers: "~10 Million", difficulty: "Category III: Hard" },
  INWB: { name: "West Bengal", language: "Bengali", speakers: "~97 Million", difficulty: "Category III: Hard" },
};

const IndiaMap = () => {
  const [svgContent, setSvgContent] = useState<string>('');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const currentHoveredPathRef = useRef<SVGPathElement | null>(null);

  // Load SVG content
  useEffect(() => {
    fetch('/in.svg')
      .then(res => res.text())
      .then(data => setSvgContent(data))
      .catch(err => console.error('Error loading SVG:', err));
  }, []);

  // Setup event listeners using direct DOM manipulation (no React state)
  useEffect(() => {
    if (!svgContent) return;

    const container = mapContainerRef.current;
    const tooltip = tooltipRef.current;
    if (!container || !tooltip) return;

    const timer = setTimeout(() => {
      const svg = container.querySelector<SVGSVGElement>("svg");
      const paths = container.querySelectorAll<SVGPathElement>("#features path");

      // Set SVG to be responsive and contained
      if (svg) {
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.style.maxHeight = "600px";
      }

      // Hide tooltip initially
      tooltip.style.display = "none";

      const handleMouseEnter = (e: MouseEvent) => {
        const path = e.currentTarget as SVGPathElement;
        const stateId = path.id;
        const data = stateLanguageData[stateId];

        // Reset previous hovered path
        if (currentHoveredPathRef.current && currentHoveredPathRef.current !== path) {
          currentHoveredPathRef.current.style.transform = "scale(1)";
          currentHoveredPathRef.current.style.fill = "#6f9c76";
        }

        if (data) {
          // Update tooltip content directly
          tooltip.innerHTML = `
            <h4 class="font-bold text-md mb-1">${data.name}</h4>
            <div class="text-sm space-y-0.5">
              <p><span class="font-semibold">Language:</span> ${data.language}</p>
              <p><span class="font-semibold">Speakers:</span> ${data.speakers}</p>
              <p><span class="font-semibold">Difficulty:</span> ${data.difficulty} (~1,100 hours)</p>
            </div>
          `;
          tooltip.style.display = "block";
          
          path.style.transform = "scale(1.05)";
          path.style.transformOrigin = "center";
          path.style.fill = "#f97316";
          path.parentElement?.appendChild(path);
          currentHoveredPathRef.current = path;
        }
      };

      const handleMouseLeave = (e: MouseEvent) => {
        const path = e.currentTarget as SVGPathElement;
        const stateId = path.id;
        const data = stateLanguageData[stateId];
        
        if (data) {
          tooltip.style.display = "none";
          path.style.transform = "scale(1)";
          path.style.fill = "#6f9c76";
          currentHoveredPathRef.current = null;
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (tooltip.style.display === "block") {
          tooltip.style.left = `${e.clientX + 15}px`;
          tooltip.style.top = `${e.clientY + 15}px`;
        }
      };

      // Add event listeners to all paths
      paths.forEach(path => {
        path.style.transition = "all 0.2s ease-in-out";
        path.style.cursor = "pointer";
        
        // Use addEventListener with proper event types
        path.addEventListener("mouseenter", handleMouseEnter as EventListener);
        path.addEventListener("mouseleave", handleMouseLeave as EventListener);
        path.addEventListener("mousemove", handleMouseMove as EventListener);
      });

      // Cleanup function
      return () => {
        paths.forEach(path => {
          path.removeEventListener("mouseenter", handleMouseEnter as EventListener);
          path.removeEventListener("mouseleave", handleMouseLeave as EventListener);
          path.removeEventListener("mousemove", handleMouseMove as EventListener);
        });
      };
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [svgContent]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" ref={mapContainerRef}>
      {/* Tooltip using ref instead of state */}
      <div
        ref={tooltipRef}
        className="fixed p-3 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-xl pointer-events-none z-[9999] border border-gray-200 dark:border-gray-700"
        style={{ display: 'none' }}
      />
      <div 
        className="w-full flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

export default IndiaMap;
