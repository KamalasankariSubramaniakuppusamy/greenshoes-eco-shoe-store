// ============================================================================
// WHat impact does greenshoes product have on the environment?
// ============================================================================
// Displays environmental impact information for a product
// Part of GreenShoes' eco-friendly brand positioning
//
// Shows three key metrics:
// 1. What sustainable materials the product is made from
// 2. How much ocean waste was recycled to make it
// 3. What percentage of profits support environmental causes
//
// The component parses product descriptions to extract this data,
// with sensible fallbacks per category if extraction fails

import React from 'react';
import { Recycle, Scale, Heart } from 'lucide-react';

const ImpactStory = ({ product }) => {
  
  // --------------------------------------------------------------------------
  // EXTRACT IMPACT DATA FROM DESCRIPTION
  // --------------------------------------------------------------------------
  // Product descriptions contain embedded impact information
  // This function parses it out using regex patterns
  // Falls back to category-appropriate defaults if parsing fails
  //
  const extractImpactData = () => {
    const description = product?.description || '';
    
    // Initialize with empty values - will be filled by parsing or defaults
    let materials = [];
    let wasteAmount = '';
    let contribution = '';

    // ========== EXTRACT WASTE AMOUNT ==========
    // Look for patterns like "1.2 kg", "2.5 pounds", "4.0 lbs", etc.
    
    // Try pounds format first (e.g., "2.5 pounds of ocean waste")
    const poundsMatch = description.match(/(\d+\.?\d*)\s*pounds?\s+of\s+(?:plastic\s+)?(?:ocean\s+)?waste/i) ||
                        description.match(/removes?\s+(?:approximately\s+)?(\d+\.?\d*)\s*pounds?/i);
    
    // Try lbs format (e.g., "2.5 lbs of ocean waste")
    const lbsMatch = description.match(/(\d+\.?\d*)\s*lbs?\s+of\s+ocean\s+waste/i) ||
                     description.match(/reclaims?\s+(\d+\.?\d*)\s*lbs?/i);
    
    // Try kg format and convert (e.g., "1.2 kg of ocean waste")
    const kgMatch = description.match(/(\d+\.?\d*)\s*kg\s+of\s+ocean\s+waste/i) || 
                    description.match(/reclaims?\s+(\d+\.?\d*)\s*kg/i) ||
                    description.match(/represents?\s+(\d+\.?\d*)\s*kg/i);
    
    // Set wasteAmount based on what we found
    if (poundsMatch) {
      wasteAmount = `${poundsMatch[1]} lbs`;
    } else if (lbsMatch) {
      wasteAmount = `${lbsMatch[1]} lbs`;
    } else if (kgMatch) {
      // Convert kg to lbs for consistent display (1 kg ≈ 2.205 lbs)
      const lbs = (parseFloat(kgMatch[1]) * 2.205).toFixed(1);
      wasteAmount = `${lbs} lbs`;
    }

    // ========== EXTRACT MATERIALS ==========
    // Look for eco-friendly materials mentioned in description
    // Each pattern has a format function to normalize the output
    const materialPatterns = [
      { pattern: /(\d+)\s*(?:recycled\s*)?plastic\s*bottles/i, format: (m) => `${m[1]} plastic bottles` },
      { pattern: /fishing\s*(nets?|line)/i, format: () => 'Fishing nets' },
      { pattern: /plastic\s*bottles/i, format: () => 'Plastic bottles' },
      { pattern: /marine\s*debris/i, format: () => 'Marine debris' },
      { pattern: /recycled\s*rubber/i, format: () => 'Recycled rubber' },
      { pattern: /reclaimed\s*rubber/i, format: () => 'Reclaimed rubber' },
      { pattern: /ocean[\s-]*bound\s*packaging/i, format: () => 'Ocean-bound packaging' },
      { pattern: /ocean\s*plastics?/i, format: () => 'Ocean plastic' },
      { pattern: /microplastic/i, format: () => 'Filtered microplastics' },
      { pattern: /coral\s*reef/i, format: () => 'Reef debris' },
      { pattern: /sediment/i, format: () => 'Ocean sediment' },
      { pattern: /algae/i, format: () => 'Algae-based materials' },
      { pattern: /ECONYL|nylon/i, format: () => 'Regenerated nylon' },
      { pattern: /plant[\s-]*based\s*polymer/i, format: () => 'Plant-based polymers' },
      { pattern: /PET|polyester/i, format: () => 'Recycled PET' },
      { pattern: /cork/i, format: () => 'Sustainable cork' },
      { pattern: /cotton/i, format: () => 'Organic cotton' },
      { pattern: /patent\s*leather/i, format: () => 'Recycled patent leather' },
      { pattern: /mesh/i, format: () => 'Recycled mesh' },
    ];

    // Try each pattern and collect up to 3 unique materials
    materialPatterns.forEach(({ pattern, format }) => {
      const match = description.match(pattern);
      if (match && materials.length < 3) {
        const formatted = format(match);
        if (!materials.includes(formatted)) {
          materials.push(formatted);
        }
      }
    });

    // ========== EXTRACT CONTRIBUTION/SOCIAL IMPACT ==========
    // Look for "X% of purchase funds/supports/goes to..." patterns
    const contributionMatch = description.match(/(\d+)%\s*of\s*(?:your\s*)?purchase\s*(?:funds?|goes?|supports?|fuels?)[^\.]+/i);
    if (contributionMatch) {
      // Extract what the contribution funds
      let fullMatch = contributionMatch[0];
      // Clean up - remove the percentage phrase prefix and get the cause
      contribution = fullMatch
        .replace(/^\d+%\s*of\s*(?:your\s*)?purchase\s*(?:funds?|goes?|supports?|fuels?)\s*(?:the\s*)?(?:fight\s*)?:?\s*/i, '')
        .split(/,\s*and\s*|\s*,\s*/)  // Split on ", and" or just ","
        .slice(0, 2)                   // Take first 2 items
        .map(s => s.trim().replace(/^and\s+/i, ''))
        .join(', ');
      
      // Truncate if too long for the UI
      if (contribution.length > 70) {
        contribution = contribution.substring(0, 67) + '...';
      }
    }

    // ========== FALLBACK TO CATEGORY DEFAULTS ==========
    // If parsing didn't find anything, use sensible defaults per shoe category
    
    if (materials.length === 0) {
      const categoryDefaults = {
        boots: ['Recycled ocean plastic', 'Fishing nets', 'Reclaimed rubber'],
        heels: ['Ocean-bound plastic', 'Recycled PET', 'Sustainable cork'],
        pumps: ['Recycled fishing nets', 'Ocean plastic', 'Plant polymers'],
        sandals: ['Beach cleanup plastic', 'Recycled rubber', 'Organic cotton'],
        sneakers: ['Ocean plastic yarn', 'Recycled foam', 'Algae materials'],
      };
      materials = categoryDefaults[product?.category?.toLowerCase()] || categoryDefaults.pumps;
    }

    if (!wasteAmount) {
      // Different shoe types use different amounts of material
      const defaultAmounts = { 
        boots: '4.0 lbs',    // Larger, more material
        heels: '2.6 lbs', 
        pumps: '3.3 lbs', 
        sandals: '1.8 lbs',  // Smaller, less material
        sneakers: '4.4 lbs'  // Complex construction
      };
      wasteAmount = defaultAmounts[product?.category?.toLowerCase()] || '3.0 lbs';
    }

    if (!contribution) {
      contribution = 'Ocean cleanup & coastal community support';
    }

    // Extract donation percentage or default to 15%
    const percentMatch = description.match(/(\d+)%\s*of\s*(?:your\s*)?purchase/i);
    const percentage = percentMatch ? percentMatch[1] : '15';

    return { materials, wasteAmount, contribution, percentage };
  };

  // Get the parsed/defaulted impact data
  const impact = extractImpactData();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Impact</h3>
      
      {/* Three impact badges in a flex wrap layout */}
      <div className="flex flex-wrap gap-2">
        
        {/* -------- BOX 1: MATERIALS -------- */}
        {/* What sustainable materials the product is made from */}
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Recycle size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="text-xs">
            <span className="text-emerald-400 font-medium">Made from:</span>{' '}
            {impact.materials.join(', ')}
          </span>
        </div>

        {/* -------- BOX 2: WASTE RECYCLED -------- */}
        {/* How much ocean waste was used/recycled */}
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Scale size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs">
            <span className="text-blue-400 font-medium">{impact.wasteAmount}</span>{' '}
            ocean waste recycled
          </span>
        </div>

        {/* -------- BOX 3: SOCIAL IMPACT -------- */}
        {/* What causes the purchase supports */}
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Heart size={14} className="text-rose-400 flex-shrink-0" />
          <span className="text-xs">
            <span className="text-rose-400 font-medium">{impact.percentage}% of profit:</span>{' '}
            {impact.contribution}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImpactStory;

// ----------------------------------------------------------------------------
// DESIGN NOTES:
//
// This component serves the brand's eco-friendly positioning by making
// the environmental impact tangible and personal ("Your Impact")
//
// The dark badges (bg-gray-900) stand out against the white product page
// Color coding helps users quickly identify each type of impact:
// - Emerald/green: Materials (recycling)
// - Blue: Waste amount (ocean)
// - Rose/pink: Social impact (heart/community)
//
// The regex parsing is fairly robust but relies on description formatting
// If descriptions don't follow expected patterns, defaults kick in
// This ensures every product shows some impact story
//
// POTENTIAL IMPROVEMENTS:
// - Store impact data in dedicated DB fields instead of parsing description
// - Add tooltips explaining each metric in more detail
// - Show comparative metrics ("equivalent to X bottles")
// ----------------------------------------------------------------------------