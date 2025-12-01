import React from 'react';
import { Waves, Heart, Users, GraduationCap, Microscope, TreePine, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/?scrollTo=products');
  };
  const impactStats = [
    { value: '85,000+', label: 'kg of plastic removed', icon: Waves },
    { value: '340+', label: 'cleanup jobs funded', icon: Users },
    { value: '200+', label: 'scholarships provided', icon: GraduationCap },
    { value: '25', label: 'research initiatives', icon: Microscope },
    { value: '15,000', label: 'mangrove trees planted', icon: TreePine },
    { value: '12', label: 'countries impacted', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Playfair Display', serif" }}>
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/images/about-hero-turtle.png')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/60 to-primary/80"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-2xl md:text-4xl font-light italic opacity-90">
            The Ocean Is Dying. We're Walking It Back to Life.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* The Crisis Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-xl max-w-none">
            <p className="text-2xl text-gray-700 leading-relaxed mb-8">
              There is a catastrophe unfolding in silence beneath the waves.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Every minute, a garbage truck's worth of plastic pours into our oceans. Every hour, thousands of marine creatures—whales, sea turtles, seabirds, fish—mistake that plastic for food, swallow it, and die slowly from the inside out. Every day, fishing nets abandoned in the deep continue their ghostly work, strangling coral reefs, trapping dolphins, turning thriving ecosystems into underwater graveyards.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              The numbers are staggering: over <span className="font-semibold text-primary">170 trillion plastic particles</span> now float in our seas. By 2050, there will be more plastic in the ocean than fish. The Great Pacific Garbage Patch—a swirling vortex of debris—has grown larger than Texas, larger than France and Germany combined. And it is only one of five.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              But the tragedy isn't just environmental. It's deeply, devastatingly human.
            </p>
          </div>
        </div>
      </section>

      {/* The People Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary">
            The People Who Pay the Price
          </h2>
          <div className="prose prose-xl max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Along the coastlines of Indonesia, India, the Philippines, Ghana, and countless other nations, entire communities have built their lives around the sea. Fishermen whose fathers and grandfathers cast nets into these same waters now pull up more plastic than fish. Women who once harvested seaweed and shellfish find their tide pools choked with bottle caps and microfibers. Children play on beaches that have become dumping grounds for the world's waste—waste that originated thousands of miles away, in countries that will never see the devastation they've caused.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              These communities didn't create this crisis. But they are the ones suffocating under its weight.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              When fish populations collapse, families go hungry. When tourism disappears because beaches are buried in trash, local economies crumble. When plastic pollution infiltrates the food chain, it's the coastal poor—those who depend most directly on the sea for protein—who consume the highest concentrations of microplastics, toxins, and heavy metals.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed font-medium italic text-center py-6">
              The ocean's crisis is a human rights crisis. An economic crisis. A health crisis. And for too long, the world has looked away.
            </p>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4 text-primary">
            We Looked Toward the Waves
          </h2>
          <p className="text-center text-gray-500 mb-12 italic text-xl">
            What if the waste destroying our oceans could become something beautiful?
          </p>
          <div className="prose prose-xl max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              GreenShoes was born from a single, stubborn question: <em>What if the waste destroying our oceans could become something beautiful? Something powerful? Something that walks the pollution right back out of the water?</em>
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6 font-medium">
              We are not a shoe company that happens to care about sustainability. We are an ocean rescue mission that happens to make extraordinary footwear.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Every pair of GreenShoes begins its life as debris—plastic bottles pulled from the Mediterranean, fishing nets untangled from coral in the Maldives, synthetic rope hauled up from Arctic shipping lanes, microplastic-contaminated sediment filtered from Caribbean shores. We work with cleanup crews across six continents, diving into the crisis at its source, partnering with the coastal communities who know these waters best.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Through innovative material science, we alchemize ocean waste into ECONYL® regenerated nylon, plant-based leather alternatives, recycled rubber soles, and luxuriously soft vegan textiles. The result? Footwear that rivals—and often surpasses—the quality of traditional luxury brands. Shoes you don't wear <em>despite</em> their origins, but <em>because</em> of them.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4">
            Not Charity. Partnership.
          </h2>
          <p className="text-center text-white/80 mb-12 max-w-2xl mx-auto text-lg">
            We don't believe in rescue narratives where wealthy outsiders swoop in to save distant communities. We believe in equity. In dignity. In building something together.
          </p>
          
          <p className="text-center text-xl mb-10 text-accent font-medium">
            Up to 22% of every purchase flows directly back to the people on the front lines:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-xl mb-2 text-accent">Fair Wages & Safety</h3>
              <p className="text-white/80">
                Equipment for cleanup divers working in hazardous conditions—the men and women who wade into polluted waters so the rest of us don't have to.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-xl mb-2 text-accent">Income Support</h3>
              <p className="text-white/80">
                For fisherwomen transitioning from collapsing fisheries to sustainable ocean farming—seaweed cultivation, shellfish restoration, eco-tourism.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-xl mb-2 text-accent">Educational Scholarships</h3>
              <p className="text-white/80">
                For the daughters and sons of coastal families, opening doors to marine biology, environmental law, and leadership roles shaping ocean policy.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-xl mb-2 text-accent">Healthcare Funding</h3>
              <p className="text-white/80">
                For communities bearing the toxic burden of plastic pollution—because caring for the ocean means caring for the people who depend on it.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 md:col-span-2">
              <h3 className="font-semibold text-xl mb-2 text-accent">Research Grants</h3>
              <p className="text-white/80">
                For scientists developing next-generation solutions: biodegradable fishing gear, plastic-eating enzymes, ocean filtration systems, coral restoration techniques.
              </p>
            </div>
          </div>

          <p className="text-center mt-10 text-white/90 italic text-lg">
            When you buy a pair of GreenShoes, you're not making a donation. You're making an investment—in technology, in community, in a future where the ocean and the people who love it can thrive together.
          </p>
        </div>
      </section>

      {/* Luxury Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary">
            Luxury Without Compromise
          </h2>
          <div className="prose prose-xl max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium text-center">
              Let's be clear: we are not asking you to sacrifice style for sustainability.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              The <em>Bjorn</em> platform boot doesn't just command attention—it hauls 2.4 kg of Arctic debris out of the sea. The <em>Lorelei</em> lace-up bootie doesn't just captivate—it funds scholarships for marine biologists. The <em>Bubble</em> classic pump doesn't just close deals—it closes the loop on ocean plastic. The <em>Shimmer</em> sneaker doesn't just move with you—it moves fishing families toward sustainable futures.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Every silhouette in our collection is designed with the same obsessive attention to craft, comfort, and beauty that defines the world's most coveted luxury houses. We work with master artisans. We source the finest sustainable materials. We refuse to cut corners—because the ocean deserves better, and so do you.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed font-semibold text-center py-4">
              This is not eco-fashion as compromise. This is eco-fashion as elevation.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-4 text-primary">
            The Ripple Effect
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
            One pair of shoes cannot save the ocean. But one pair becomes ten. Ten becomes a thousand. A thousand becomes a movement.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <stat.icon className="w-10 h-10 mx-auto mb-3 text-accent" />
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tide Is Turning Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary">
            The Tide Is Turning
          </h2>
          <div className="prose prose-xl max-w-none">
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              There is a moment, if you've ever stood at the ocean's edge, when the tide shifts. The water that has been rushing outward pauses, gathers itself, and begins to return. It is almost imperceptible at first—a subtle change in pressure, a quieting of the waves—but once it begins, it is unstoppable.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6 font-medium">
              We believe we are living in that moment.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              The crisis is real. The damage is immense. But so is the awakening. Around the world, people are opening their eyes to what we've done to our seas—and demanding change. Governments are banning single-use plastics. Corporations are rethinking packaging. Scientists are engineering solutions once thought impossible. And consumers, millions of them, are choosing differently.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              GreenShoes exists to accelerate that turning tide. To prove that commerce can be a force for restoration. To demonstrate that luxury and responsibility are not opposites—they are partners. To walk, step by step, toward an ocean that teems with life instead of trash.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary via-primary to-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Heart className="w-14 h-14 mx-auto mb-6 text-accent" />
          <h2 className="text-4xl md:text-5xl font-serif mb-8">Join Us</h2>
          <div className="prose prose-xl prose-invert max-w-none mb-10">
            <p className="text-xl text-white/90 leading-relaxed mb-6">
              When you slip on a pair of GreenShoes, you are not just wearing a shoe.
            </p>
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              You are wearing the story of a plastic bottle that once drifted in the Pacific, now reborn as something beautiful. You are wearing the labor of a diver in Indonesia who pulled fishing nets from a reef so that coral could breathe again. You are wearing the hope of a young woman in the Philippines whose scholarship will make her the first marine biologist in her family. You are wearing a promise—to the ocean, to the communities who protect it, to the future we are building together.
            </p>
            <p className="text-3xl text-accent font-medium mb-6">
              You are wearing change.
            </p>
            <p className="text-lg text-white/80 leading-relaxed">
              And with every step you take, the ocean gets a little cleaner. The tide rises a little higher. The impossible becomes a little more possible.
            </p>
          </div>
          
          <button 
            onClick={handleShopNow}
            className="inline-flex items-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg font-semibold text-xl hover:bg-accent/90 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Shop the Collection
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-4xl md:text-5xl font-serif text-primary mb-4">
            This is GreenShoes.
          </p>
          <p className="text-2xl text-gray-600 italic">
            Luxury, reclaimed. Oceans, restored. One step at a time.
          </p>
        </div>
      </section>

      {/* No Returns Notice */}
      <section className="py-8 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-serif mb-2 text-primary">Important Notice</h3>
            <p className="text-gray-600">
              <strong>No Returns or Refunds:</strong> All sales are final. We stand behind the quality of our products and encourage you to review product details carefully before purchase. This policy allows us to maximize our contribution to ocean cleanup and coastal community support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;