import React from 'react';
import { Recycle, Scale, Heart } from 'lucide-react';

const ImpactStory = ({ product }) => {
  // Extract impact data from the product description
  const extractImpactData = () => {
    const description = product?.description || '';
    
    // Default fallback data
    let materials = [];
    let wasteAmount = '';
    let contribution = '';

    // --- EXTRACT WASTE AMOUNT ---
    // Look for patterns like "1.2 kg", "2.5 pounds", "4.0 lbs", etc.
    
    // Check for pounds first (e.g., "2.5 pounds")
    const poundsMatch = description.match(/(\d+\.?\d*)\s*pounds?\s+of\s+(?:plastic\s+)?(?:ocean\s+)?waste/i) ||
                        description.match(/removes?\s+(?:approximately\s+)?(\d+\.?\d*)\s*pounds?/i);
    
    // Check for lbs (e.g., "2.5 lbs")
    const lbsMatch = description.match(/(\d+\.?\d*)\s*lbs?\s+of\s+ocean\s+waste/i) ||
                     description.match(/reclaims?\s+(\d+\.?\d*)\s*lbs?/i);
    
    // Check for kg (e.g., "1.2 kg") - convert to lbs
    const kgMatch = description.match(/(\d+\.?\d*)\s*kg\s+of\s+ocean\s+waste/i) || 
                    description.match(/reclaims?\s+(\d+\.?\d*)\s*kg/i) ||
                    description.match(/represents?\s+(\d+\.?\d*)\s*kg/i);
    
    if (poundsMatch) {
      wasteAmount = `${poundsMatch[1]} lbs`;
    } else if (lbsMatch) {
      wasteAmount = `${lbsMatch[1]} lbs`;
    } else if (kgMatch) {
      // Convert kg to lbs (1 kg = 2.205 lbs)
      const lbs = (parseFloat(kgMatch[1]) * 2.205).toFixed(1);
      wasteAmount = `${lbs} lbs`;
    }

    // --- EXTRACT MATERIALS ---
    // Look for materials mentioned: plastic bottles, fishing nets, rubber, etc.
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

    materialPatterns.forEach(({ pattern, format }) => {
      const match = description.match(pattern);
      if (match && materials.length < 3) {
        const formatted = format(match);
        if (!materials.includes(formatted)) {
          materials.push(formatted);
        }
      }
    });

    // --- EXTRACT CONTRIBUTION/IMPACT ---
    // Look for percentage and what it funds
    const contributionMatch = description.match(/(\d+)%\s*of\s*(?:your\s*)?purchase\s*(?:funds?|goes?|supports?|fuels?)[^\.]+/i);
    if (contributionMatch) {
      // Extract what the contribution funds - get text after the percentage phrase
      let fullMatch = contributionMatch[0];
      // Clean it up - remove the "X% of purchase funds" part and get the rest
      contribution = fullMatch
        .replace(/^\d+%\s*of\s*(?:your\s*)?purchase\s*(?:funds?|goes?|supports?|fuels?)\s*(?:the\s*)?(?:fight\s*)?:?\s*/i, '')
        .split(/,\s*and\s*|\s*,\s*/)
        .slice(0, 2)
        .map(s => s.trim().replace(/^and\s+/i, ''))
        .join(', ');
      
      // Truncate if too long
      if (contribution.length > 70) {
        contribution = contribution.substring(0, 67) + '...';
      }
    }

    // --- FALLBACK TO CATEGORY DEFAULTS IF EXTRACTION FAILED ---
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
      const defaultAmounts = { boots: '4.0 lbs', heels: '2.6 lbs', pumps: '3.3 lbs', sandals: '1.8 lbs', sneakers: '4.4 lbs' };
      wasteAmount = defaultAmounts[product?.category?.toLowerCase()] || '3.0 lbs';
    }

    if (!contribution) {
      contribution = 'Ocean cleanup & coastal community support';
    }

    // Get percentage from description or default to 15%
    const percentMatch = description.match(/(\d+)%\s*of\s*(?:your\s*)?purchase/i);
    const percentage = percentMatch ? percentMatch[1] : '15';

    return { materials, wasteAmount, contribution, percentage };
  };

  const impact = extractImpactData();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Impact</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Box 1: Materials Used */}
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Recycle size={14} className="text-emerald-400 flex-shrink-0" />
          <span className="text-xs">
            <span className="text-emerald-400 font-medium">Made from:</span>{' '}
            {impact.materials.join(', ')}
          </span>
        </div>

        {/* Box 2: Waste Recycled */}
        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-2">
          <Scale size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs">
            <span className="text-blue-400 font-medium">{impact.wasteAmount}</span>{' '}
            ocean waste recycled
          </span>
        </div>

        {/* Box 3: Social Impact */}
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