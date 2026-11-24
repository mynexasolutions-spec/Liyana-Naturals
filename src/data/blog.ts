import type { BlogPost } from "@/types";

export const blogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "5 Benefits of Aloe Vera for Your Skin",
    slug: "5-benefits-of-aloe-vera-for-your-skin",
    subtitle:
      "Why cold-pressed Aloe Barbadensis leaf juice remains nature's most trusted elixir for calm, deeply hydrated, resilient skin.",
    excerpt:
      "Discover why pure cold-pressed aloe vera calms inflammation, promotes deep hydration, and revitalizes sun-exposed skin naturally.",
    category: "Skincare",
    readTime: "4 min read",
    publishedAt: "Nov 15, 2024",
    featured: true,
    coverImage: "/images/blog/Aloe_01.png",
    tags: ["Aloe Vera", "Hydration", "Sensitive Skin", "Clean Skincare"],
    relatedProductSlugs: ["nourishing-face-cream", "avocado-soap"],
    author: {
      name: "Dr. Maya Lin",
      role: "Botanical Chemist",
      bio: "Dr. Maya Lin leads botanical extraction research at Liyana Naturals, focusing on cold-pressed active preservation and barrier-friendly skincare formulations.",
    },
    keyTakeaways: [
      "Cold-pressed aloe vera delivers over 75 active vitamins, enzymes, and amino acids without heavy oils.",
      "Polysaccharides inside the inner leaf gel bind moisture to the epidermis for lasting, non-greasy hydration.",
      "Natural antioxidants (vitamins C & E) help soothe redness after sun exposure or environmental stress.",
      "Gentle enough for daily morning and evening layering across oily, dry, and sensitive skin types.",
    ],
    sections: [
      {
        id: "deep-weightless-hydration",
        heading: "1. Deep, Weightless Hydration Without Clogged Pores",
        paragraphs: [
          "Unlike heavy occlusive creams that sit on the surface, pure aloe vera gel is composed of nearly 96% water paired with naturally occurring mucopolysaccharides. These plant sugars act like moisture magnets, drawing hydration into the outer layers of your skin while leaving a breathable, velvety finish.",
          "For humid climates or combination skin, layering an aloe-rich cream or gel right after cleansing locks in dewiness without triggering congestion or midday shine.",
        ],
        highlightTip:
          "Apply your moisturizer onto slightly damp skin within 60 seconds of cleansing to maximize aloe's water-binding capacity.",
      },
      {
        id: "calms-redness-and-sun-stress",
        heading: "2. Soothes Inflammation and Sun-Exposed Skin",
        paragraphs: [
          "Aloe Barbadensis contains gentle plant compounds such as acemannan and salicylic-like soothing agents that calm visible redness, post-sun warmth, and razor irritation. That cooling sensation is not merely superficial—it helps comfort stressed skin barriers quickly.",
        ],
        bullets: [
          "Eases tightness after outdoor sun or wind exposure",
          "Calms reactive patches caused by harsh synthetic cleansers",
          "Supports skin comfort after gentle exfoliation",
        ],
      },
      {
        id: "supports-skin-barrier-repair",
        heading: "3. Reinforces Your Natural Moisture Barrier",
        paragraphs: [
          "A compromised skin barrier loses hydration rapidly and reacts easily to pollution. Aloe vera delivers vitamins A, C, and E alongside trace minerals like zinc, helping nourish micro-stressed areas and keep your barrier supple.",
          "When paired with plant ceramides and cold-pressed botanical oils—such as in our Nourishing Face Cream—aloe acts as the ideal hydrating foundation.",
        ],
      },
      {
        id: "gentle-antioxidant-defense",
        heading: "4. Daily Antioxidant Defense & Even Tone",
        paragraphs: [
          "Environmental free radicals gradually dull skin radiance. Cold-processed aloe preserves delicate polyphenols and beta-carotene that help defend against everyday oxidative stress, keeping your complexion fresh, balanced, and visibly clear.",
        ],
      },
      {
        id: "balances-all-skin-types",
        heading: "5. Naturally Balances Oily, Dry, and Sensitive Complexions",
        paragraphs: [
          "Because aloe vera mirrors the skin's natural mildly acidic pH, it helps harmonize excess sebum in oily T-zones while comforting dry cheeks. Whether you prefer a minimalist two-step ritual or a layered routine, pure botanical aloe fits effortlessly.",
        ],
      },
    ],
  },
  {
    id: "blog-2",
    title: "Natural Skincare Routine at Home",
    slug: "natural-skincare-routine-at-home",
    subtitle:
      "Build an effortless morning and evening botanical ritual with chamomile, vitamin C, and plant-derived moisture—no 10-step clutter required.",
    excerpt:
      "Step-by-step everyday organic rituals with chamomile and botanical essences to nourish, protect, and illuminate your complexion.",
    category: "Beauty Rituals",
    readTime: "5 min read",
    publishedAt: "Nov 12, 2024",
    featured: false,
    coverImage: "/images/blog/Chamomile_02.png",
    tags: ["Daily Routine", "Chamomile", "Glow Ritual", "Holistic Beauty"],
    relatedProductSlugs: ["herbal-face-serum", "nourishing-face-cream"],
    author: {
      name: "Elena Ward",
      role: "Holistic Esthetician",
      bio: "Elena Ward is a certified holistic esthetician dedicated to mindful, barrier-first skincare rituals that honor circadian skin rhythms.",
    },
    keyTakeaways: [
      "Consistency with 3–4 gentle botanical steps outperforms complex, irritating multi-acid routines.",
      "Morning care focuses on antioxidant protection and light hydration; evening care supports recovery.",
      "Chamomile, rosehip, and aloe work synergistically to brighten and calm without stripping natural lipids.",
    ],
    sections: [
      {
        id: "less-is-more-philosophy",
        heading: "Why a Mindful 4-Step Botanical Routine Works Best",
        paragraphs: [
          "Modern skincare often overwhelms the skin with too many active formulas layered at once. At Liyana Naturals, we believe your skin thrives on calm consistency: gentle cleansing, targeted plant antioxidants, breathable hydration, and mindful facial massage.",
          "By choosing paraben-free, sulphate-free formulations crafted with whole botanical extracts, your skin barrier can repair itself naturally every day.",
        ],
      },
      {
        id: "morning-radiance-ritual",
        heading: "Morning Ritual: Cleanse, Brighten & Protect",
        paragraphs: [
          "Your morning routine should awaken the skin gently without stripping away overnight lipid balance.",
        ],
        bullets: [
          "Step 1 — Gentle Cleanse: Splash with lukewarm water or use a mild cold-processed botanical cleanser like Avocado Soap.",
          "Step 2 — Botanical Serum: Press 3–4 drops of Herbal Face Serum enriched with stable Vitamin C and rosehip into damp skin.",
          "Step 3 — Barrier Hydration: Seal in moisture with a pea-sized layer of Nourishing Face Cream.",
          "Step 4 — Sun Shield: Finish with broad-spectrum sun protection before heading outdoors.",
        ],
        highlightTip:
          "Pressing serums gently with warm palms instead of rubbing reduces tugging around delicate eye and cheek contours.",
      },
      {
        id: "evening-chamomile-wind-down",
        heading: "Evening Ritual: Calm, Replenish & Restore",
        paragraphs: [
          "At night, skin shifts into repair mode. Chamomile-infused botanicals help melt away daytime tension while plant squalane and phytoceramides restore softness while you sleep.",
          "Take two extra minutes to perform upward sweeping strokes along your jawline and cheekbones—this encourages lymphatic flow and leaves your complexion refreshed by morning.",
        ],
      },
      {
        id: "weekly-botanical-reset",
        heading: "Weekly Self-Care Touches at Home",
        paragraphs: [
          "Once or twice a week, pair your evening routine with a warm chamomile steam towel before applying your serum. The gentle warmth softens pores and turns everyday skincare into a grounding sanctuary.",
        ],
      },
    ],
  },
  {
    id: "blog-3",
    title: "How to Get Strong & Healthy Hair",
    slug: "how-to-get-strong-and-healthy-hair",
    subtitle:
      "Combine time-tested Ayurvedic herbs like bhringraj, amla, and rosemary with modern scalp nourishment for thicker, lustrous strands.",
    excerpt:
      "Essential nutrients, Ayurvedic scalp oil massage rituals, and active herb extracts for thicker, lustrous, root-to-tip hair health.",
    category: "Hair Wellness",
    readTime: "6 min read",
    publishedAt: "Nov 10, 2024",
    featured: false,
    coverImage: "/images/blog/Golden_03.png",
    tags: ["Hair Growth", "Ayurveda", "Scalp Care", "Rosemary & Amla"],
    relatedProductSlugs: ["hair-growth-oil", "herbal-hair-mask", "hair-growth-serum"],
    author: {
      name: "Julian Brooks",
      role: "Herbal Formulator",
      bio: "Julian Brooks formulates cold-infused Ayurvedic hair oils and peptide scalp serums, uniting traditional herbalism with trichology science.",
    },
    keyTakeaways: [
      "Strong hair starts with a nourished, well-circulated scalp rather than surface shine alone.",
      "Rosemary, bhringraj, and amla help fortify follicles and minimize seasonal breakage.",
      "Alternating warm oil massages with a lightweight water-based scalp serum suits every hair density.",
    ],
    sections: [
      {
        id: "scalp-first-approach",
        heading: "1. Treat Your Scalp Like Facial Skin",
        paragraphs: [
          "Healthy, resilient hair grows from balanced follicles. Product buildup, hard water, and harsh sulphates can leave the scalp tight or congested, weakening strands before they even reach full length.",
          "Shifting to sulphate-free cleansing and regular scalp care creates the clean, nutrient-rich environment your roots need to thrive.",
        ],
      },
      {
        id: "ayurvedic-oiling-ritual",
        heading: "2. The Weekly Ayurvedic Champi (Scalp Oil Massage)",
        paragraphs: [
          "Warming 4–6 drops of Hair Growth Oil between your fingertips and massaging in slow circular motions stimulates local microcirculation and delivers fat-soluble nutrients from golden jojoba, bhringraj, and rosemary directly to the root.",
        ],
        bullets: [
          "Part hair into 4–5 sections for even scalp coverage",
          "Use finger pads—never fingernails—for 5 minutes of gentle massage",
          "Leave on for 2 hours or overnight before washing with a mild cleanser",
        ],
        highlightTip:
          "Avoid over-oiling mid-lengths on wash day; focus oil on the scalp and apply a nourishing mask to ends so hair rinses effortlessly.",
      },
      {
        id: "deep-conditioning-and-daily-serum",
        heading: "3. Deep Mask Repair & Lightweight Daily Serums",
        paragraphs: [
          "Between oil days, dry or heat-styled lengths crave amino acids and plant lipids. Applying an Herbal Hair Mask with hibiscus and fenugreek once a week smooths the cuticle, detangles knots, and prevents split ends.",
          "For busy weekdays when you prefer zero oiliness, a water-based Hair Growth Serum with rosemary distillate and biotin peptides keeps follicles energized all day without weighing hair down.",
        ],
      },
      {
        id: "everyday-hair-habits",
        heading: "4. Simple Everyday Habits That Prevent Breakage",
        paragraphs: [
          "Wet hair is at its most elastic and fragile state. Gently squeeze moisture with a soft cotton T-shirt or microfiber towel, detangle from ends upward with a wide-tooth comb, and protect strands with a silk or satin pillowcase at night.",
        ],
      },
    ],
  },
];
