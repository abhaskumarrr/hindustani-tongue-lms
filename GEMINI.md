# AI Coding Agent Prompt: Interactive India Map Implementation

## Project Context Analysis
You are working on **Hindustani Tongue LMS**, a language learning platform built with:
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS 4.1.9 with custom CSS variables
- **UI Components**: shadcn/ui (New York style) with Radix UI
- **Animations**: tailwindcss-animate + custom CSS animations (no Framer Motion)
- **Icons**: Lucide React
- **Architecture**: App router with component-based structure

## Current State Analysis
The existing `components/IndiaMap.tsx` has:
- Basic SVG interaction with tooltip system
- Limited animation using CSS transforms
- State-language mapping with 36 regions
- Dark mode support via CSS variables
- Uses `components/ui/InIcon.tsx` for SVG rendering

## Task Objective
**Completely rewrite** `components/IndiaMap.tsx` to create a premium, culturally-rich interactive map that showcases India's linguistic diversity using the SVG data from `/in.svg` in the project root.

## Technical Requirements

### 1. Project Integration
```typescript
// File: components/IndiaMap.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  Globe,
  Sparkles,
  Heart,
  Award,
  MapPin,
  Languages
} from 'lucide-react';
```

### 2. Design System Integration
Use the existing color system:
```css
/* Primary Colors (from globals.css) */
--primary: oklch(0.65 0.15 45);     /* Saffron Orange #FF6B35 */
--secondary: oklch(0.75 0.12 75);   /* Cultural Gold #D4AF37 */
--accent: oklch(0.75 0.12 75);      /* Gold Accent */
--muted: oklch(0.97 0.005 45);      /* Warm Muted */
```

**State Visual System:**
- **Default**: `fill-muted stroke-border hover:fill-primary/20`
- **Course Available**: `fill-primary/10 stroke-primary/30`
- **Hover**: `fill-primary/30 stroke-primary scale-105`
- **Selected**: `fill-primary/50 stroke-primary ring-2 ring-primary/20`

### 3. Enhanced State Data Architecture
```typescript
interface LanguageCourse {
  name: string;
  nativeScript: string;
  family: 'Indo-Aryan' | 'Dravidian' | 'Sino-Tibetan' | 'Austro-Asiatic' | 'Others';
  speakers: number;
  courseAvailable: boolean;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  culturalSignificance: string;
  famousWorks: string[];
  learnersCount: number;
  completionRate: number;
}

interface RegionData {
  id: string;
  name: string;
  type: 'state' | 'unionTerritory';
  capital: string;
  established: string;
  population: number;
  literacyRate: number;
  languages: LanguageCourse[];
  primaryLanguage: LanguageCourse;
  culturalFacts: string[];
  festivals: string[];
  landmarks: string[];
  cuisine: string[];
  region: 'North' | 'South' | 'East' | 'West' | 'Northeast' | 'Central';
  coordinates: { lat: number; lng: number };
}
```

### 4. Complete State Coverage & Accurate Language Mapping

**All 28 States + 8 Union Territories:**

```typescript
const COMPREHENSIVE_REGION_DATA: Record<string, RegionData> = {
  // NORTHERN STATES
  INDL: {
    name: 'Delhi', type: 'unionTerritory', capital: 'New Delhi',
    primaryLanguage: { name: 'Hindi', nativeScript: 'हिन्दी', courseAvailable: true, speakers: 16000000 },
    languages: [
      { name: 'Hindi', nativeScript: 'हिन्दी', family: 'Indo-Aryan', courseAvailable: true },
      { name: 'Punjabi', nativeScript: 'ਪੰਜਾਬੀ', family: 'Indo-Aryan', courseAvailable: true },
      { name: 'Urdu', nativeScript: 'اردو', family: 'Indo-Aryan', courseAvailable: true }
    ],
    culturalFacts: ['Historic Mughal capital', 'Modern political center'],
    learnersCount: 2800, region: 'North'
  },
  
  // Continue for ALL states with accurate mapping...
  INPB: {
    name: 'Punjab', type: 'state', capital: 'Chandigarh',
    primaryLanguage: { name: 'Punjabi', nativeScript: 'ਪੰਜਾਬੀ', courseAvailable: true },
    region: 'North', learnersCount: 1200
  },
  
  // SOUTHERN STATES  
  INTN: {
    name: 'Tamil Nadu', type: 'state', capital: 'Chennai',
    primaryLanguage: { name: 'Tamil', nativeScript: 'தமிழ்', courseAvailable: true },
    culturalFacts: ['Oldest living language', 'Rich literary tradition'],
    region: 'South', learnersCount: 980
  },
  
  INAP: {
    name: 'Andhra Pradesh', type: 'state', capital: 'Amaravati',
    primaryLanguage: { name: 'Telugu', nativeScript: 'తెలుగు', courseAvailable: true },
    region: 'South', learnersCount: 750
  },
  
  INTG: {
    name: 'Telangana', type: 'state', capital: 'Hyderabad',
    primaryLanguage: { name: 'Telugu', nativeScript: 'తెలుగు', courseAvailable: true },
    region: 'South', learnersCount: 650
  }
  
  // ... Complete mapping for ALL 36 regions
};
```

### 5. Advanced Interactive Features

**Multi-Level Tooltip System:**
```typescript
const EnhancedTooltip = ({ region, position }: { region: RegionData, position: {x: number, y: number} }) => (
  <div 
    className="fixed z-50 pointer-events-none transition-all duration-200 ease-out"
    style={{ 
      left: position.x + 15, 
      top: position.y - 10,
      transform: 'translateY(-100%)'
    }}
  >
    <Card className="w-80 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {region.name}
          </CardTitle>
          <Badge variant={region.primaryLanguage.courseAvailable ? "default" : "outline"}>
            {region.type === 'state' ? 'State' : 'UT'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Capital:</span>
            <p className="font-medium">{region.capital}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Region:</span>
            <p className="font-medium">{region.region}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Languages className="size-4 text-primary" />
            <span className="font-medium">Primary Language</span>
          </div>
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
            <div>
              <p className="font-medium">{region.primaryLanguage.name}</p>
              <p className="text-sm text-muted-foreground">{region.primaryLanguage.nativeScript}</p>
            </div>
            {region.primaryLanguage.courseAvailable && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Course Available
              </Badge>
            )}
          </div>
        </div>
        
        {region.culturalFacts.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-secondary" />
              <span className="font-medium text-sm">Cultural Significance</span>
            </div>
            <p className="text-sm text-muted-foreground">{region.culturalFacts[0]}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-3" />
            <span>{region.learnersCount.toLocaleString()} learners</span>
          </div>
          <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
            Explore <BookOpen className="size-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);
```

### 6. Advanced Animation System
Use CSS-based animations following the project's pattern:

```typescript
const useMapAnimations = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes regionPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.02); opacity: 0.9; }
      }
      
      @keyframes regionHighlight {
        0% { fill: hsl(var(--muted)); stroke-width: 0.5; }
        100% { fill: hsl(var(--primary) / 0.3); stroke-width: 2; }
      }
      
      @keyframes fadeInStagger {
        0% { opacity: 0; transform: scale(0.95); }
        100% { opacity: 1; transform: scale(1); }
      }
      
      .region-default {
        fill: hsl(var(--muted));
        stroke: hsl(var(--border));
        stroke-width: 0.5;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
      }
      
      .region-available {
        fill: hsl(var(--primary) / 0.1);
        stroke: hsl(var(--primary) / 0.3);
        stroke-width: 1;
      }
      
      .region-hover {
        fill: hsl(var(--primary) / 0.3) !important;
        stroke: hsl(var(--primary)) !important;
        stroke-width: 2 !important;
        transform: scale(1.02);
        filter: drop-shadow(0 4px 12px hsl(var(--primary) / 0.2));
      }
      
      .region-selected {
        fill: hsl(var(--primary) / 0.5) !important;
        stroke: hsl(var(--primary)) !important;
        stroke-width: 2 !important;
        animation: regionPulse 2s ease-in-out infinite;
      }
      
      .loading-animation path {
        animation: fadeInStagger 600ms ease-out forwards;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);
};
```

### 7. Educational Modal System
```typescript
const RegionDetailModal = ({ region, isOpen, onClose }: {
  region: RegionData | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!region) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <MapPin className="size-5 text-primary" />
            </div>
            <div>
              <h2>{region.name}</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {region.type === 'state' ? 'State' : 'Union Territory'} • {region.region} India
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Language Learning Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="size-5 text-primary" />
                  Language Learning Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {region.languages.map((lang, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{lang.name}</h4>
                        <span className="text-lg">{lang.nativeScript}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Family: {lang.family}</p>
                        <p>Speakers: {(lang.speakers / 1000000).toFixed(1)}M+</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {lang.courseAvailable ? (
                        <Button size="sm" className="bg-primary">
                          Start Learning
                          <BookOpen className="size-3 ml-1" />
                        </Button>
                      ) : (
                        <Badge variant="outline">Coming Soon</Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {lang.learnersCount} enrolled
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Cultural Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="size-5 text-secondary" />
                  Cultural Heritage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Facts</h4>
                    <ul className="space-y-1 text-sm">
                      {region.culturalFacts.map((fact, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Heart className="size-3 text-primary mt-0.5 shrink-0" />
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Demographics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Population:</span>
                        <span>{(region.population / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Literacy Rate:</span>
                        <span>{region.literacyRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Established:</span>
                        <span>{region.established}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Stats Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{region.learnersCount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Active Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{region.primaryLanguage.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <Button className="w-full" size="sm">
                  <Globe className="size-4 mr-2" />
                  Start Your Journey
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Capital:</span>
                  <span className="font-medium">{region.capital}</span>
                </div>
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span className="font-medium">{region.region}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{region.type === 'state' ? 'State' : 'UT'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### 8. Mobile Optimization
```typescript
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};

// Mobile-specific interactions
const handleMobileTouch = useCallback((region: RegionData) => {
  if (isMobile) {
    // Show modal directly on mobile tap
    setSelectedRegion(region);
    setModalOpen(true);
  }
}, [isMobile]);
```

### 9. Accessibility Implementation
```typescript
// Add these props to each SVG path element
const accessibilityProps = {
  role: "button",
  tabIndex: 0,
  "aria-label": `${region.name}, ${region.primaryLanguage.name} speaking region. ${region.primaryLanguage.courseAvailable ? 'Course available' : 'Course coming soon'}`,
  onKeyDown: (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleRegionSelect(region);
    }
  },
  onFocus: (e: FocusEvent) => handleRegionHover(region, e),
  onBlur: () => setHoveredRegion(null)
};
```

### 10. Performance Optimizations
```typescript
// Memoize expensive calculations
const regionStats = useMemo(() => {
  return Object.values(COMPREHENSIVE_REGION_DATA).reduce((stats, region) => ({
    totalLearners: stats.totalLearners + region.learnersCount,
    availableCourses: stats.availableCourses + (region.primaryLanguage.courseAvailable ? 1 : 0),
    totalRegions: stats.totalRegions + 1,
    languageFamilies: new Set([...stats.languageFamilies, ...region.languages.map(l => l.family)])
  }), { totalLearners: 0, availableCourses: 0, totalRegions: 0, languageFamilies: new Set() });
}, []);

// Debounce hover effects
const debouncedHover = useMemo(
  () => debounce((region: RegionData | null) => setHoveredRegion(region), 100),
  []
);
```

## Expected Deliverable
Create a **single comprehensive file** `components/IndiaMap.tsx` that:

1. **Completely replaces** the existing component
2. **Uses the exact same import path** in `app/page.tsx`
3. **Maintains visual consistency** with the existing design system
4. **Provides educational value** through rich cultural and linguistic information
5. **Offers smooth, performant interactions** on all devices
6. **Follows accessibility standards** with ARIA labels and keyboard navigation
7. **Includes comprehensive state coverage** with accurate language mapping

## Success Criteria
- ✅ All 28 states + 8 UTs accurately mapped and interactive
- ✅ Smooth CSS-based animations (no Framer Motion dependency)
- ✅ Culturally respectful and educationally valuable content
- ✅ Mobile-responsive with touch-friendly interactions  
- ✅ Dark mode support using existing CSS variables
- ✅ Integration with existing shadcn/ui components
- ✅ TypeScript compliance with proper interfaces
- ✅ Performance optimized for smooth 60fps interactions

This interactive map should serve as the **centerpiece educational tool** that inspires users to explore India's incredible linguistic diversity and begin their language learning journey with cultural pride and understanding.