// Static seed content for Quiza — authored once, inserted into Convex on first boot.

export interface SeedCategory {
  name: string;
  tagline: string;
  hue: number; // accent hue for category identity
}

export interface SeedQuestion {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface SeedQuiz {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  estMinutes: number;
  questions: SeedQuestion[];
}

export const CATEGORIES: SeedCategory[] = [
  { name: "Science", tagline: "From quarks to ecosystems", hue: 210 },
  { name: "Technology", tagline: "How the digital world works", hue: 250 },
  { name: "History", tagline: "The events that shaped us", hue: 30 },
  { name: "Geography", tagline: "Rivers, peaks and plates", hue: 150 },
  { name: "Business", tagline: "Markets, money and strategy", hue: 85 },
  { name: "Entertainment", tagline: "Screen, stage and sound", hue: 330 },
  { name: "Sports", tagline: "Records, rules and legends", hue: 15 },
  { name: "General Knowledge", tagline: "A bit of everything", hue: 265 },
];

export const QUIZZES: SeedQuiz[] = [
  {
    slug: "foundations-of-physics",
    title: "Foundations of Physics",
    description:
      "Motion, energy and light — the core principles that explain how the physical universe behaves.",
    category: "Science",
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "Which of Newton's laws states that every action has an equal and opposite reaction?",
        options: ["First law", "Second law", "Third law", "Law of gravitation"],
        correctIndex: 2,
        explanation:
          "Newton's third law establishes that forces always occur in pairs: body A exerts on B a force equal in magnitude and opposite in direction to the force B exerts on A.",
      },
      {
        text: "What is the SI unit of electrical resistance?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correctIndex: 2,
        explanation:
          "Resistance is measured in ohms (Ω), defined as one volt per ampere, after Georg Simon Ohm.",
      },
      {
        text: "Light travels fastest through which medium?",
        options: ["Water", "Glass", "Diamond", "Vacuum"],
        correctIndex: 3,
        explanation:
          "The speed of light c ≈ 299,792 km/s is a maximum in vacuum; any material medium slows it down in proportion to its refractive index.",
      },
      {
        text: "Kinetic energy of a moving object depends on its mass and which other quantity?",
        options: ["Velocity", "Acceleration", "Volume", "Temperature"],
        correctIndex: 0,
        explanation:
          "Kinetic energy equals one-half mass times velocity squared (½mv²), so it grows with the square of speed.",
      },
      {
        text: "Sound cannot travel through which of the following?",
        options: ["Steel", "Water", "Air", "Vacuum"],
        correctIndex: 3,
        explanation:
          "Sound is a mechanical wave that requires a material medium to propagate — in vacuum there is nothing to compress, so no sound travels.",
      },
      {
        text: "Which quantity does a pendulum's period NOT depend on (for small swings)?",
        options: ["String length", "Gravity", "Bob mass", "All affect it"],
        correctIndex: 2,
        explanation:
          "For small oscillations the period T = 2π√(L/g) depends only on length and gravitational acceleration — the bob's mass cancels out.",
      },
    ],
  },
  {
    slug: "the-living-cell",
    title: "The Living Cell",
    description:
      "A tour of biology's fundamental unit — organelles, DNA and the chemistry of life.",
    category: "Science",
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "Which organelle is known as the powerhouse of the cell?",
        options: ["Ribosome", "Mitochondrion", "Golgi apparatus", "Lysosome"],
        correctIndex: 1,
        explanation:
          "Mitochondria generate most of the cell's ATP through cellular respiration, earning them the famous nickname.",
      },
      {
        text: "DNA in cells carries information using how many types of nucleotide bases?",
        options: ["Two", "Three", "Four", "Twenty"],
        correctIndex: 2,
        explanation:
          "DNA encodes information in four bases — adenine, thymine, cytosine and guanine — paired as A–T and C–G.",
      },
      {
        text: "Which structure controls what enters and leaves a cell?",
        options: ["Cell membrane", "Nucleolus", "Cytoplasm", "Vacuole"],
        correctIndex: 0,
        explanation:
          "The selectively permeable cell membrane regulates transport, keeping essential molecules in and harmful ones out.",
      },
      {
        text: "Photosynthesis primarily takes place in which organelle?",
        options: ["Chloroplast", "Nucleus", "Endoplasmic reticulum", "Peroxisome"],
        correctIndex: 0,
        explanation:
          "Chloroplasts contain chlorophyll, which captures light energy to convert CO₂ and water into glucose.",
      },
      {
        text: "What is the process by which cells divide to produce two identical daughter cells?",
        options: ["Meiosis", "Mitosis", "Apoptosis", "Osmosis"],
        correctIndex: 1,
        explanation:
          "Mitosis produces two genetically identical diploid cells; meiosis produces gametes with half the chromosome number.",
      },
      {
        text: "Human red blood cells lack which structure when mature?",
        options: ["Hemoglobin", "Membrane", "Nucleus", "Cytoplasm"],
        correctIndex: 2,
        explanation:
          "Mature mammalian red blood cells expel their nucleus to make more room for hemoglobin, maximising oxygen carriage.",
      },
    ],
  },
  {
    slug: "web-internet-fundamentals",
    title: "Web & Internet Fundamentals",
    description:
      "Protocols, browsers and the plumbing behind every click — test your grasp of how the web actually works.",
    category: "Technology",
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "What does HTTPS add on top of HTTP?",
        options: [
          "Faster routing",
          "Encryption via TLS",
          "Image compression",
          "Ad blocking",
        ],
        correctIndex: 1,
        explanation:
          "HTTPS wraps HTTP traffic in TLS encryption, protecting data integrity and confidentiality between browser and server.",
      },
      {
        text: "Which protocol translates domain names into IP addresses?",
        options: ["FTP", "SMTP", "DNS", "SSH"],
        correctIndex: 2,
        explanation:
          "The Domain Name System resolves human-readable names like example.com into the numeric addresses machines route to.",
      },
      {
        text: "In web development, what is the DOM?",
        options: [
          "A database of websites",
          "The browser's in-memory document tree",
          "A CSS preprocessor",
          "A hosting service",
        ],
        correctIndex: 1,
        explanation:
          "The Document Object Model is the browser's live tree representation of a page, which scripts read and manipulate.",
      },
      {
        text: "Which HTTP status code signals 'Not Found'?",
        options: ["200", "301", "404", "500"],
        correctIndex: 2,
        explanation:
          "404 tells the client the requested resource doesn't exist at this address; 500 indicates a server-side error instead.",
      },
      {
        text: "What is the primary role of a web browser's cache?",
        options: [
          "Store passwords",
          "Speed up repeat visits by reusing assets",
          "Block pop-ups",
          "Compress downloads",
        ],
        correctIndex: 1,
        explanation:
          "Caching keeps recently fetched images, stylesheets and scripts locally so subsequent visits skip re-downloading them.",
      },
      {
        text: "IPv4 addresses are made up of how many bits?",
        options: ["16", "32", "64", "128"],
        correctIndex: 1,
        explanation:
          "IPv4 uses 32-bit addresses (about 4.3 billion), whereas IPv6 expanded to 128 bits to avoid exhaustion.",
      },
    ],
  },
  {
    slug: "ai-ml-basics",
    title: "AI & Machine Learning Basics",
    description:
      "Models, training and inference — the vocabulary and intuition behind modern intelligent systems.",
    category: "Technology",
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "In machine learning, what is 'training' a model?",
        options: [
          "Writing its source code",
          "Adjusting parameters from examples",
          "Encrypting its outputs",
          "Deploying it to production",
        ],
        correctIndex: 1,
        explanation:
          "Training iteratively adjusts model parameters so predictions on known examples improve — the model 'learns' patterns from data.",
      },
      {
        text: "Which type of learning uses labelled data?",
        options: ["Unsupervised", "Supervised", "Reinforcement", "Transfer"],
        correctIndex: 1,
        explanation:
          "Supervised learning fits functions to input–output pairs where the correct answer (label) is provided for each example.",
      },
      {
        text: "'Overfitting' means a model…",
        options: [
          "Performs well on training data but poorly on new data",
          "Is too simple to capture patterns",
          "Trains too slowly",
          "Uses too little memory",
        ],
        correctIndex: 0,
        explanation:
          "An overfit model memorises noise in its training set rather than generalisable structure, so it fails on unseen cases.",
      },
      {
        text: "A neural network's 'neurons' are best described as…",
        options: [
          "Simulated biological brain cells",
          "Simple units computing weighted sums plus an activation",
          "Database records",
          "Graphics card cores",
        ],
        correctIndex: 1,
        explanation:
          "Each artificial neuron multiplies inputs by weights, sums them, adds bias, and passes the result through a non-linear activation function.",
      },
      {
        text: "Large language models like GPT are trained primarily to predict…",
        options: [
          "Images from captions",
          "The next token in a sequence",
          "Website rankings",
          "Database queries",
        ],
        correctIndex: 1,
        explanation:
          "Autoregressive LLMs learn by predicting the next token given preceding context — scale this up and coherent generation emerges.",
      },
      {
        text: "Which task is a classic unsupervised learning problem?",
        options: [
          "Spam classification",
          "House price prediction",
          "Customer segmentation via clustering",
          "Face verification",
        ],
        correctIndex: 2,
        explanation:
          "Clustering groups unlabelled data by similarity — no ground-truth labels are needed, which defines unsupervised learning.",
      },
    ],
  },
  {
    slug: "modern-world-1900-1950",
    title: "The Modern World: 1900–1950",
    description:
      "Half a century that compressed revolution, depression and world war into living memory.",
    category: "History",
    difficulty: "Medium",
    estMinutes: 6,
    questions: [
      {
        text: "In which year did World War I begin?",
        options: ["1912", "1914", "1916", "1918"],
        correctIndex: 1,
        explanation:
          "The assassination of Archduke Franz Ferdinand in June 1914 triggered the July Crisis and general war by August.",
      },
      {
        text: "The Treaty of Versailles formally ended which conflict?",
        options: [
          "Franco-Prussian War",
          "World War I",
          "Russo-Japanese War",
          "World War II",
        ],
        correctIndex: 1,
        explanation:
          "Signed in 1919, the treaty imposed heavy reparations and territorial losses on Germany — widely seen as seeding WWII grievances.",
      },
      {
        text: "Who was the first person to walk on the Moon? (Hint: within this era's space-race aftermath)",
        options: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "John Glenn"],
        correctIndex: 2,
        explanation:
          "Neil Armstrong stepped onto the lunar surface on 20 July 1969 during Apollo 11; Gagarin was first in orbit, not on the Moon.",
      },
      {
        text: "The Great Depression began with the Wall Street crash in which year?",
        options: ["1919", "1925", "1929", "1933"],
        correctIndex: 2,
        explanation:
          "The October 1929 collapse triggered a decade of global economic contraction and mass unemployment.",
      },
      {
        text: "Which country was the first to use nuclear weapons in war?",
        options: ["Germany", "Japan", "Soviet Union", "United States"],
        correctIndex: 3,
        explanation:
          "The United States dropped atomic bombs on Hiroshima and Nagasaki in August 1945, ending World War II.",
      },
      {
        text: "India and Pakistan gained independence from British rule in which year?",
        options: ["1945", "1947", "1950", "1952"],
        correctIndex: 1,
        explanation:
          "The Indian Independence Act took effect on 15 August 1947, partitioning British India into two dominions.",
      },
    ],
  },
  {
    slug: "rivers-peaks-plates",
    title: "Rivers, Peaks & Plates",
    description:
      "Landforms, borders and the tectonic forces that build them — a journey across the map.",
    category: "Geography",
    difficulty: "Medium",
    estMinutes: 5,
    questions: [
      {
        text: "Which is the longest river in the world by most conventional measures?",
        options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
        correctIndex: 1,
        explanation:
          "The Nile (~6,650 km) is traditionally longest, though some studies measuring the Amazon's full course dispute the title.",
      },
      {
        text: "Mount Everest sits on the border between Nepal and which other country/region?",
        options: ["India", "Bhutan", "China (Tibet)", "Pakistan"],
        correctIndex: 2,
        explanation:
          "Everest straddles the Nepal–Tibet (China) border in the Mahalangur Himal section of the Himalayas.",
      },
      {
        text: "Which desert is the largest hot desert on Earth?",
        options: ["Gobi", "Kalahari", "Sahara", "Atacama"],
        correctIndex: 2,
        explanation:
          "The Sahara spans roughly 9.2 million km² across North Africa — nearly the size of the United States.",
      },
      {
        text: "The Ring of Fire is associated with which geological feature?",
        options: [
          "Subduction zones and volcanism around the Pacific",
          "A desert belt across Africa",
          "Mid-Atlantic ridge vents only",
          "Antarctic ice sheets",
        ],
        correctIndex: 0,
        explanation:
          "Pacific plate subduction produces the dense concentration of earthquakes and volcanoes ringing the ocean basin.",
      },
      {
        text: "Which strait separates Asia from North America at its closest point?",
        options: [
          "Strait of Malacca",
          "Bering Strait",
          "Strait of Hormuz",
          "Bass Strait",
        ],
        correctIndex: 1,
        explanation:
          "The Bering Strait lies between Siberia and Alaska, about 82 km wide at its narrowest.",
      },
      {
        text: "What is the world's largest ocean by surface area?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctIndex: 3,
        explanation:
          "The Pacific covers about 165 million km² — larger than all landmasses combined.",
      },
    ],
  },
  {
    slug: "markets-and-money",
    title: "Markets & Money",
    description:
      "Supply, demand, interest rates and the mechanics of capital — sharper than average.",
    category: "Business",
    difficulty: "Hard",
    estMinutes: 7,
    questions: [
      {
        text: "If demand rises while supply stays constant, equilibrium price generally…",
        options: ["Falls", "Stays flat", "Rises", "Becomes undefined"],
        correctIndex: 2,
        explanation:
          "Higher demand shifts the curve outward along a fixed supply curve, raising both equilibrium price and quantity.",
      },
      {
        text: "What does GDP measure?",
        options: [
          "Total wealth of citizens",
          "Market value of final goods and services produced",
          "Government spending only",
          "Corporate profits nationwide",
        ],
        correctIndex: 1,
        explanation:
          "Gross Domestic Product sums the market value of all final goods and services produced within a country over a period.",
      },
      {
        text: "Central banks typically fight high inflation by…",
        options: [
          "Cutting interest rates",
          "Raising interest rates",
          "Printing more money",
          "Lowering reserve requirements",
        ],
        correctIndex: 1,
        explanation:
          "Raising policy rates makes borrowing costlier, cooling demand and easing price pressure — the standard inflation countermeasure.",
      },
      {
        text: "Opportunity cost refers to…",
        options: [
          "Accounting fees incurred",
          "The value of the next-best forgone alternative",
          "Interest on debt",
          "Sunk costs already spent",
        ],
        correctIndex: 1,
        explanation:
          "Every choice sacrifices the best alternative use of the same resources — that sacrificed value is the opportunity cost.",
      },
      {
        text: "In finance, diversification reduces…",
        options: [
          "Expected returns to zero",
          "Unsystematic (specific) risk",
          "Market beta",
          "Liquidity",
        ],
        correctIndex: 1,
        explanation:
          "Holding uncorrelated assets smooths out company- or sector-specific shocks; systematic market risk remains.",
      },
      {
        text: "A company's gross margin is calculated as…",
        options: [
          "(Revenue − COGS) / Revenue",
          "Net income / Total assets",
          "EBITDA / Debt",
          "Dividends / Share price",
        ],
        correctIndex: 0,
        explanation:
          "Gross margin shows what fraction of revenue survives after direct production costs, before operating expenses.",
      },
    ],
  },
  {
    slug: "cinema-the-classics",
    title: "Cinema: The Classics",
    description:
      "Directors, milestones and lines you can quote — for anyone who takes film history seriously.",
    category: "Entertainment",
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "Which film features the line “Here's looking at you, kid”?",
        options: ["Casablanca", "Citizen Kane", "Gone with the Wind", "The Apartment"],
        correctIndex: 0,
        explanation:
          "Humphrey Bogart's Rick says it to Ilsa in Casablanca (1942) — among cinema's most quoted lines.",
      },
      {
        text: "Who directed the 1994 masterpiece Pulp Fiction?",
        options: [
          "Martin Scorsese",
          "Quentin Tarantino",
          "Coen Brothers",
          "David Fincher",
        ],
        correctIndex: 1,
        explanation:
          "Tarantino's nonlinear crime anthology won the Palme d'Or and redefined 90s independent cinema.",
      },
      {
        text: "Which film won the first Academy Award for Best Animated Feature?",
        options: [
          "Toy Story",
          "Shrek",
          "Spirited Away",
          "Monsters, Inc.",
        ],
        correctIndex: 1,
        explanation:
          "Shrek took the inaugural award in 2002 (for films of 2001); Spirited Away won the following year.",
      },
      {
        text: "Alfred Hitchcock's Psycho (1960) is famous for its shower scene scored by…",
        options: [
          "Ennio Morricone",
          "Bernard Herrmann",
          "John Williams",
          "Hans Zimmer",
        ],
        correctIndex: 1,
        explanation:
          "Herrmann's shrieking staccato strings made the scene iconic — Hitchcock originally considered playing it without music.",
      },
      {
        text: "The first feature-length film with synchronised dialogue was…",
        options: [
          "The Jazz Singer",
          "Metropolis",
          "Wings",
          "Sunrise",
        ],
        correctIndex: 0,
        explanation:
          "The Jazz Singer (1927) ushered in the sound era with its Vitaphone talking sequences.",
      },
      {
        text: "Parasite (2019) made history as the first Best Picture winner from which country?",
        options: ["Japan", "China", "South Korea", "France"],
        correctIndex: 2,
        explanation:
          "Bong Joon-ho's Parasite became the first non-English-language film to win Hollywood's top prize.",
      },
    ],
  },
  {
    slug: "the-olympic-record",
    title: "The Olympic Record",
    description:
      "Venues, legends and moments that defined the Games — from Athens 1896 to today.",
    category: "Sports",
    difficulty: "Easy",
    estMinutes: 5,
    questions: [
      {
        text: "Where were the first modern Olympic Games held in 1896?",
        options: ["Paris", "Athens", "London", "Rome"],
        correctIndex: 1,
        explanation:
          "Athens hosted the revival of the Games, honouring their ancient Greek origins, under Pierre de Coubertin's IOC.",
      },
      {
        text: "How often are the Summer Olympics traditionally held?",
        options: ["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"],
        correctIndex: 2,
        explanation:
          "The four-year interval between Games is called an Olympiad, echoing the ancient Greek reckoning.",
      },
      {
        text: "Usain Bolt set the 100 m world record at 9.58 seconds in which year?",
        options: ["2004", "2008", "2009", "2012"],
        correctIndex: 2,
        explanation:
          "Bolt ran 9.58 at the 2009 World Championships in Berlin, shaving 0.11 off his own Olympic record from Beijing 2008.",
      },
      {
        text: "The five interlocking Olympic rings represent…",
        options: [
          "Five sponsors",
          "Five continents united by sport",
          "Five founding sports",
          "Five ancient city-states",
        ],
        correctIndex: 1,
        explanation:
          "Designed in 1913, the rings symbolise the union of Africa, the Americas, Asia, Europe and Oceania.",
      },
      {
        text: "Which country has won the most total Olympic medals overall?",
        options: [
          "United States",
          "China",
          "Russia / Soviet Union",
          "Great Britain",
        ],
        correctIndex: 0,
        explanation:
          "The United States leads the all-time medal table with well over 3,000 cumulative medals across Summer and Winter Games.",
      },
      {
        text: "The marathon distance of 42.195 km was standardised in which century?",
        options: [
          "Ancient Greece",
          "18th century",
          "20th century",
          "It was never standardised",
        ],
        correctIndex: 2,
        explanation:
          "The odd figure comes from the 1908 London route to Windsor Castle; the IAAF fixed 42.195 km as standard in 1921.",
      },
    ],
  },
  {
    slug: "mixed-bag-vol-1",
    title: "Mixed Bag Vol. 1",
    description:
      "Six deceptively varied questions spanning science, culture and the everyday — a balanced workout.",
    category: "General Knowledge",
    difficulty: "Medium",
    estMinutes: 5,
    questions: [
      {
        text: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correctIndex: 2,
        explanation:
          "Au comes from aurum, Latin for gold; Ag is silver (argentum).",
      },
      {
        text: "How many keys does a standard full-size piano have?",
        options: ["76", "84", "88", "96"],
        correctIndex: 2,
        explanation:
          "Since the late 1800s, pianos have standardised on 88 keys — 52 white and 36 black.",
      },
      {
        text: "Which planet has the most moons confirmed in our solar system?",
        options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        correctIndex: 1,
        explanation:
          "Saturn pulled ahead with 140+ confirmed moons after 2023 discoveries, overtaking Jupiter's 95.",
      },
      {
        text: "The Great Barrier Reef lies off the coast of which country?",
        options: ["Brazil", "Indonesia", "Australia", "Philippines"],
        correctIndex: 2,
        explanation:
          "Australia's north-east coast hosts the reef — the largest living structure on Earth, visible from orbit.",
      },
      {
        text: "Who wrote the dystopian novel Nineteen Eighty-Four?",
        options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"],
        correctIndex: 1,
        explanation:
          "Eric Arthur Blair, writing as George Orwell, published it in 1949; Huxley wrote Brave New World.",
      },
      {
        text: "In human anatomy, what is the body's largest organ?",
        options: ["Liver", "Brain", "Skin", "Lungs"],
        correctIndex: 2,
        explanation:
          "Skin is the largest organ by area and weight, averaging around 2 m² in adults.",
      },
    ],
  },
  {
    slug: "quickfire-general-knowledge",
    title: "Quickfire General Knowledge",
    description:
      "Fast facts, zero fluff — a perfect first quiz or a warm-up before something heavier.",
    category: "General Knowledge",
    difficulty: "Easy",
    estMinutes: 4,
    questions: [
      {
        text: "What colour do you get by mixing blue and yellow paint?",
        options: ["Green", "Purple", "Orange", "Brown"],
        correctIndex: 0,
        explanation:
          "Blue and yellow pigments absorb complementary wavelengths, leaving green as the dominant reflected colour.",
      },
      {
        text: "How many minutes are in a full day?",
        options: ["1,200", "1,440", "1,800", "2,400"],
        correctIndex: 1,
        explanation:
          "24 hours × 60 minutes = 1,440 minutes per day.",
      },
      {
        text: "Which is the tallest animal in the world?",
        options: ["Elephant", "Giraffe", "Ostrich", "Moose"],
        correctIndex: 1,
        explanation:
          "Adult giraffes reach 5–6 metres tall, thanks largely to a half-metre neck and long forelegs.",
      },
      {
        text: "What does 'www' stand for in a website address?",
        options: [
          "Wide World Web",
          "World Wide Web",
          "Web Wide Wire",
          "Wireless World Web",
        ],
        correctIndex: 1,
        explanation:
          "Tim Berners-Lee named his 1989 hypertext system the World Wide Web at CERN.",
      },
      {
        text: "Which fruit contains its seeds on the outside?",
        options: ["Kiwi", "Strawberry", "Plum", "Cherry"],
        correctIndex: 1,
        explanation:
          "Those 'seeds' are actually tiny achenes — dry fruits themselves — perched on the strawberry's exterior.",
      },
      {
        text: "How many sides does a hexagon have?",
        options: ["Five", "Six", "Seven", "Eight"],
        correctIndex: 1,
        explanation:
          "Hexa- is Greek for six; hexagons tile perfectly, which is why honeycombs use them.",
      },
    ],
  },
];
