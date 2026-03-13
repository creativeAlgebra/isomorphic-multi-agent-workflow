"""
Test Corpus for IMAW A/B Validation
====================================
50 source concepts × target metaphors spanning diverse domains.
Each entry includes a domain_category for stratified analysis.

Source concepts are kept concise but structurally rich — they must contain
entities, relationships, and at least one operational rule to give the
Decomposition Agent meaningful structure to extract.
"""

TEST_CORPUS = [
    # ─── Infrastructure & DevOps (1-5) ────────────────────────────────────
    {
        "id": 1,
        "source": (
            "Kubernetes Cluster Architecture: "
            "1. Control Plane manages worker nodes and Pods. "
            "2. kube-apiserver exposes the Kubernetes API as the frontend. "
            "3. etcd is a consistent key-value store for all cluster data. "
            "4. kube-scheduler watches for unassigned Pods and selects nodes based on resource requirements. "
            "5. kube-controller-manager runs controller processes to regulate state. "
            "6. Worker Nodes run containerized applications. "
            "7. kubelet is an agent on each node ensuring containers run in a Pod. "
            "8. Pod is the smallest deployable unit. "
            "Rule: The scheduler cannot place a Pod on a node lacking designated CPU/Memory resources."
        ),
        "metaphor": "Running a massive 19th-century luxury hotel",
        "domain_category": "infrastructure",
    },
    {
        "id": 2,
        "source": (
            "DNS Resolution: A client queries a recursive resolver, which checks its cache. "
            "On cache miss, it queries root nameservers, then TLD nameservers, then authoritative nameservers. "
            "Each level returns either the answer or a referral to the next level. "
            "TTL values control how long records stay cached. "
            "Rule: A resolver must not return stale records past their TTL."
        ),
        "metaphor": "A medieval postal courier network delivering sealed letters",
        "domain_category": "infrastructure",
    },
    {
        "id": 3,
        "source": (
            "CI/CD Pipeline: Code is committed to a repository. A build server detects changes and triggers "
            "compilation, unit tests, integration tests, and security scans in sequence. If all pass, "
            "the artifact is deployed to staging. A manual approval gate controls promotion to production. "
            "Rule: A failing test at any stage halts the entire pipeline."
        ),
        "metaphor": "A sushi chef's omakase preparation — course by course, each inspected before serving",
        "domain_category": "infrastructure",
    },
    {
        "id": 4,
        "source": (
            "Load Balancer Architecture: Incoming traffic hits a load balancer that distributes requests "
            "across a pool of backend servers using round-robin or least-connections algorithms. "
            "Health checks ping each server periodically. Unhealthy servers are removed from the pool. "
            "Session affinity (sticky sessions) can bind a user to one server. "
            "Rule: No traffic may be routed to a server that has failed its health check."
        ),
        "metaphor": "A maître d' seating guests across multiple dining rooms in a grand restaurant",
        "domain_category": "infrastructure",
    },
    {
        "id": 5,
        "source": (
            "Docker Containerization: An application and its dependencies are packaged into a container image. "
            "Images are built from a Dockerfile layer by layer. Containers are isolated runtime instances of images. "
            "A container registry stores and distributes images. Containers share the host OS kernel but have "
            "isolated filesystems and network namespaces. "
            "Rule: A container cannot access the host filesystem unless explicitly granted a volume mount."
        ),
        "metaphor": "An astronaut's self-contained spacesuit system on a space station",
        "domain_category": "infrastructure",
    },

    # ─── Finance & Economics (6-10) ───────────────────────────────────────
    {
        "id": 6,
        "source": (
            "Options Pricing (Black-Scholes): A call option gives the holder the right to buy an asset at a "
            "strike price before expiration. The option's value depends on underlying price, strike price, "
            "time to expiration, volatility, and risk-free interest rate. Delta measures price sensitivity. "
            "Theta represents time decay. As expiration approaches, time value erodes. "
            "Rule: An option cannot have negative time value."
        ),
        "metaphor": "A farmer's right to harvest fruit from a neighbor's tree before winter",
        "domain_category": "finance",
    },
    {
        "id": 7,
        "source": (
            "Fractional Reserve Banking: Banks accept deposits and are required to hold a fraction as reserves. "
            "The remainder can be lent out. Borrowers deposit loan proceeds into other banks, multiplying the "
            "money supply. The reserve ratio determines the money multiplier. The central bank sets the ratio "
            "and acts as lender of last resort. "
            "Rule: A bank cannot lend more than its excess reserves above the required ratio."
        ),
        "metaphor": "A village bakery that lends rising dough to neighbors, who return it with interest in bread",
        "domain_category": "finance",
    },
    {
        "id": 8,
        "source": (
            "Blockchain Consensus (Proof of Work): Miners compete to solve a cryptographic hash puzzle. "
            "The first to find a valid nonce broadcasts the block. Other nodes verify the solution and "
            "append the block to their chain. The longest chain is considered canonical. Mining difficulty "
            "adjusts every N blocks to maintain a target block time. "
            "Rule: A block with an invalid hash or double-spent transactions is rejected by the network."
        ),
        "metaphor": "Gold prospectors competing to find nuggets that unlock a communal vault",
        "domain_category": "finance",
    },
    {
        "id": 9,
        "source": (
            "Supply and Demand Equilibrium: As price rises, quantity demanded falls and quantity supplied rises. "
            "The equilibrium price is where supply equals demand. A price ceiling below equilibrium creates shortage. "
            "A price floor above equilibrium creates surplus. Shifts in supply or demand curves change equilibrium. "
            "Rule: At equilibrium, there is no tendency for price to change."
        ),
        "metaphor": "Two children on a seesaw in a playground — one represents buyers, the other sellers",
        "domain_category": "finance",
    },
    {
        "id": 10,
        "source": (
            "Venture Capital Funding Rounds: Startups raise capital in stages — seed, Series A, B, C. "
            "Each round dilutes existing shareholders. Investors receive preferred stock with liquidation preferences. "
            "Valuation increases between rounds reflect growth milestones. Due diligence precedes investment. "
            "Rule: Preferred shareholders must be paid before common shareholders in a liquidation event."
        ),
        "metaphor": "A traveling theater troupe recruiting patrons to fund increasingly grand performances",
        "domain_category": "finance",
    },

    # ─── Biology & Medicine (11-15) ───────────────────────────────────────
    {
        "id": 11,
        "source": (
            "mRNA Vaccine Mechanism: Synthetic mRNA encoding a viral spike protein is encapsulated in lipid nanoparticles. "
            "After injection, cells take up the nanoparticles, ribosomes translate the mRNA into spike proteins. "
            "The immune system recognizes the spike protein as foreign and generates antibodies. Memory B-cells and T-cells "
            "are formed for future rapid response. The mRNA degrades within days. "
            "Rule: The mRNA never enters the cell nucleus or alters DNA."
        ),
        "metaphor": "A town crier distributing wanted posters so the sheriff's deputies can recognize an outlaw",
        "domain_category": "biology",
    },
    {
        "id": 12,
        "source": (
            "CRISPR-Cas9 Gene Editing: A guide RNA (gRNA) is designed to complement a target DNA sequence. "
            "The Cas9 protein binds the gRNA and searches the genome for matching sequences. At the target site, "
            "Cas9 creates a double-strand break. The cell's repair machinery either disables the gene (NHEJ) "
            "or inserts a new sequence (HDR) using a provided template. "
            "Rule: Cas9 cannot cut DNA without a matching guide RNA sequence."
        ),
        "metaphor": "A locksmith with a blueprint searching a building to find and replace one specific lock",
        "domain_category": "biology",
    },
    {
        "id": 13,
        "source": (
            "Photosynthesis (Light Reactions): Chlorophyll in thylakoid membranes absorbs photons, exciting electrons. "
            "Electrons pass through Photosystem II, the electron transport chain, and Photosystem I. "
            "Water molecules are split to replace lost electrons, releasing oxygen. The electron flow generates "
            "a proton gradient that drives ATP synthase. NADP+ is reduced to NADPH. "
            "Rule: Without light energy, the electron transport chain cannot operate."
        ),
        "metaphor": "A hydroelectric dam system powered by sunlight-driven water pumps",
        "domain_category": "biology",
    },
    {
        "id": 14,
        "source": (
            "Immune System Adaptive Response: Dendritic cells capture antigens and present them to T-helper cells "
            "in lymph nodes. Activated T-helpers stimulate B-cells to produce antibodies. Cytotoxic T-cells directly "
            "kill infected cells. After the infection clears, most effector cells die but memory cells persist. "
            "Rule: T-cells cannot activate without antigen presentation by an antigen-presenting cell."
        ),
        "metaphor": "A medieval kingdom's intelligence network — scouts, war council, knights, and archivists",
        "domain_category": "biology",
    },
    {
        "id": 15,
        "source": (
            "Mitosis: A cell duplicates its chromosomes during S-phase. In prophase, chromosomes condense and the "
            "spindle apparatus forms. During metaphase, chromosomes align at the cell's equator. In anaphase, "
            "sister chromatids separate and move to opposite poles. Telophase and cytokinesis divide the cell into "
            "two identical daughter cells. "
            "Rule: The cell cycle checkpoint prevents mitosis if DNA damage is detected."
        ),
        "metaphor": "A master calligrapher copying a sacred manuscript and splitting the originals between two libraries",
        "domain_category": "biology",
    },

    # ─── Networking & Security (16-20) ────────────────────────────────────
    {
        "id": 16,
        "source": (
            "TCP/IP Three-Way Handshake: A client sends a SYN packet to a server. The server responds with SYN-ACK. "
            "The client sends a final ACK, establishing the connection. Data can then flow bidirectionally. "
            "Sequence numbers track packet order. Retransmission occurs if ACK is not received within a timeout. "
            "Rule: Data transmission cannot begin until the three-way handshake is complete."
        ),
        "metaphor": "Two Renaissance diplomats exchanging sealed letters before opening trade negotiations",
        "domain_category": "networking",
    },
    {
        "id": 17,
        "source": (
            "OAuth 2.0 Authorization Flow: A user clicks 'Login with Provider.' The app redirects to the auth server. "
            "The user authenticates and grants permissions. The auth server returns an authorization code. The app "
            "exchanges the code for access and refresh tokens. The access token is used for API calls. "
            "Rule: An expired access token must be refreshed using the refresh token before making further API calls."
        ),
        "metaphor": "A guest at a masquerade ball receiving a dance card from the host to access different rooms",
        "domain_category": "networking",
    },
    {
        "id": 18,
        "source": (
            "Public Key Cryptography (RSA): Each party generates a public-private key pair. The public key encrypts; "
            "only the matching private key decrypts. Digital signatures are created by signing a hash with the private "
            "key; anyone can verify with the public key. Certificate authorities vouch for public key ownership. "
            "Rule: Knowing the public key must not enable derivation of the private key."
        ),
        "metaphor": "A pair of magical lockboxes — anyone can lock one, but only its twin key can open it",
        "domain_category": "networking",
    },
    {
        "id": 19,
        "source": (
            "Firewall Packet Filtering: A firewall inspects incoming and outgoing packets against a ruleset. "
            "Rules specify allowed/denied traffic by source IP, destination IP, port, and protocol. "
            "Stateful firewalls track connection state to allow return traffic. Rules are evaluated top-down; "
            "the first matching rule applies. A default deny rule catches unmatched packets. "
            "Rule: Any packet not explicitly permitted by a rule must be dropped."
        ),
        "metaphor": "Castle gate guards checking travelers' papers against a royal decree scroll",
        "domain_category": "networking",
    },
    {
        "id": 20,
        "source": (
            "VPN Tunneling (IPsec): Two endpoints negotiate security associations using IKE protocol. "
            "Data packets are encrypted and encapsulated inside new IP headers. The receiving endpoint "
            "decrypts and delivers the original packet. Perfect Forward Secrecy ensures that compromising "
            "one session key doesn't compromise past sessions. "
            "Rule: Packets with invalid authentication headers must be silently discarded."
        ),
        "metaphor": "A secret underground passage between two castles with encoded messenger pigeons",
        "domain_category": "networking",
    },

    # ─── Physics & Engineering (21-25) ────────────────────────────────────
    {
        "id": 21,
        "source": (
            "Nuclear Fission in a Reactor: Uranium-235 absorbs a neutron and splits into two smaller nuclei, "
            "releasing energy and 2-3 free neutrons. Those neutrons can trigger further fissions (chain reaction). "
            "Control rods absorb excess neutrons to regulate the reaction rate. Coolant carries heat to steam "
            "generators. The moderator slows neutrons to increase fission probability. "
            "Rule: If control rods are fully withdrawn, the chain reaction becomes supercritical."
        ),
        "metaphor": "A beehive where splitting honeycombs release worker bees that split more combs",
        "domain_category": "physics",
    },
    {
        "id": 22,
        "source": (
            "Transistor Logic (MOSFET): A MOSFET has gate, source, and drain terminals. Applying voltage to the "
            "gate creates a conductive channel between source and drain. In enhancement mode, no current flows "
            "without gate voltage. NMOS conducts when gate is high; PMOS conducts when gate is low. "
            "CMOS pairs NMOS and PMOS for low-power switching. "
            "Rule: Current cannot flow from source to drain unless the gate voltage exceeds the threshold."
        ),
        "metaphor": "A drawbridge controlled by a herald's flag — raised flag opens the road, lowered flag blocks it",
        "domain_category": "physics",
    },
    {
        "id": 23,
        "source": (
            "Thermodynamic Heat Engine (Carnot Cycle): A working fluid undergoes isothermal expansion (absorbing "
            "heat from a hot reservoir), adiabatic expansion (cooling without heat exchange), isothermal compression "
            "(rejecting heat to a cold reservoir), and adiabatic compression (heating back). The efficiency is "
            "1 - Tc/Th. "
            "Rule: No heat engine can exceed Carnot efficiency between the same two temperature reservoirs."
        ),
        "metaphor": "A watermill that draws water from a hot spring, uses it to turn wheels, and drains to a cold river",
        "domain_category": "physics",
    },
    {
        "id": 24,
        "source": (
            "Orbital Mechanics (Hohmann Transfer): A spacecraft in a lower circular orbit fires its engine at "
            "one point to enter an elliptical transfer orbit. At the opposite point of the ellipse (the apoapsis "
            "near the target orbit), it fires again to circularize into the higher orbit. The total delta-v "
            "is the sum of both burns. "
            "Rule: A transfer orbit must be tangent to both the departure and arrival orbits."
        ),
        "metaphor": "A swimmer diving from a low diving board, arcing through the air, and grabbing a high trapeze bar",
        "domain_category": "physics",
    },
    {
        "id": 25,
        "source": (
            "Superconductivity (BCS Theory): Below a critical temperature, electrons form Cooper pairs mediated "
            "by phonon interactions with the crystal lattice. Cooper pairs condense into a quantum ground state "
            "that flows without resistance. An applied magnetic field is expelled (Meissner effect) up to a "
            "critical field strength. "
            "Rule: Superconductivity is destroyed if temperature, magnetic field, or current exceeds critical values."
        ),
        "metaphor": "Ice dancers on a frozen lake — pairs glide frictionlessly until the sun warms the ice",
        "domain_category": "physics",
    },

    # ─── Law & Governance (26-30) ─────────────────────────────────────────
    {
        "id": 26,
        "source": (
            "Jury Trial Process (US): The prosecution and defense select jurors through voir dire. Opening statements "
            "are followed by the prosecution's case-in-chief, then the defense's case. Witnesses are examined and "
            "cross-examined. Closing arguments summarize the evidence. The judge instructs the jury on the law. "
            "The jury deliberates in private and returns a verdict. "
            "Rule: A guilty verdict in criminal cases requires unanimity among all jurors."
        ),
        "metaphor": "A village elders' council judging a dispute between two rival farming families",
        "domain_category": "law",
    },
    {
        "id": 27,
        "source": (
            "Patent System: An inventor files an application disclosing the invention in full. A patent examiner "
            "searches prior art to determine novelty and non-obviousness. If approved, the patent grants exclusive "
            "rights for 20 years. The holder can license the patent or sue infringers. "
            "Rule: An invention that is obvious to a person skilled in the art cannot be patented."
        ),
        "metaphor": "A wizard's guild that grants exclusive rights to cast newly discovered spells",
        "domain_category": "law",
    },
    {
        "id": 28,
        "source": (
            "Constitutional Checks and Balances: The legislature makes laws. The executive enforces laws. "
            "The judiciary interprets laws and can declare them unconstitutional. The legislature can impeach "
            "the executive. The executive can veto legislation, but the legislature can override with a supermajority. "
            "Rule: No single branch can exercise power belonging to another branch."
        ),
        "metaphor": "Three master chefs sharing one kitchen — each controls one station and taste-tests the others' dishes",
        "domain_category": "law",
    },

    # ─── Chemistry & Materials (29-33) ────────────────────────────────────
    {
        "id": 29,
        "source": (
            "Catalysis (Enzyme Kinetics): An enzyme binds a substrate at its active site, forming an enzyme-substrate "
            "complex. The enzyme lowers the activation energy, accelerating the reaction. Products are released and "
            "the enzyme is recycled. Competitive inhibitors block the active site. "
            "Rule: An enzyme's rate plateaus at saturation (all active sites occupied) — Michaelis-Menten kinetics."
        ),
        "metaphor": "A master tailor's workshop where a fitting mannequin shapes fabric into garments",
        "domain_category": "chemistry",
    },
    {
        "id": 30,
        "source": (
            "Electrochemistry (Galvanic Cell): Two half-cells contain different metals in electrolyte solutions. "
            "The more reactive metal (anode) oxidizes, releasing electrons that flow through an external circuit "
            "to the less reactive metal (cathode), which reduces. A salt bridge maintains charge neutrality. "
            "Cell voltage depends on the electrode potential difference. "
            "Rule: Electrons always flow from anode to cathode through the external circuit."
        ),
        "metaphor": "Two connected hot springs where minerals flow downhill from one pool to another through a channel",
        "domain_category": "chemistry",
    },
    {
        "id": 31,
        "source": (
            "Polymer Chain Reaction (PCR): A DNA template is heated to separate strands (denaturation). "
            "Primers anneal to complementary sequences at lower temperature. DNA polymerase extends the primers, "
            "synthesizing new strands. Each cycle doubles the target DNA. After 30 cycles, over a billion copies exist. "
            "Rule: PCR cannot amplify DNA without sequence-specific primers flanking the target region."
        ),
        "metaphor": "A printing press that photocopies a single page — each copy is copied again in the next round",
        "domain_category": "chemistry",
    },
    {
        "id": 32,
        "source": (
            "Ceramics in Modern Architecture: Traditional ceramic cladding acts as passive weatherproofing. "
            "Advanced ceramics incorporate photocatalytic surfaces that decompose pollutants under UV light. "
            "Thermal-regulating ceramics absorb excess heat during the day and release it at night, reducing "
            "HVAC reliance. The ceramic facade protects the building envelope from moisture ingress. "
            "Rule: Photocatalytic activity requires UV exposure — the reaction halts in darkness."
        ),
        "metaphor": "The lifecycle of a star evolving from a main-sequence star into a planetary nebula",
        "domain_category": "chemistry",
    },
    {
        "id": 33,
        "source": (
            "Distillation: A liquid mixture is heated in a flask. Components with lower boiling points evaporate "
            "first. Vapor rises through a fractionating column where it repeatedly condenses and re-evaporates, "
            "increasing separation purity. Pure condensate is collected at the top. "
            "Rule: Components cannot be separated if they form an azeotrope at the same composition."
        ),
        "metaphor": "A mountain range where clouds form at different altitudes, each carrying a single type of rain",
        "domain_category": "chemistry",
    },

    # ─── Military & Strategy (34-37) ──────────────────────────────────────
    {
        "id": 34,
        "source": (
            "Kotter's 8-Step Change Management applied to Enterprise AI adoption: "
            "1. Create urgency around AI disruption. 2. Form a powerful coalition of AI champions. "
            "3. Create a strategic vision for AI integration. 4. Communicate the vision widely. "
            "5. Remove obstacles blocking AI pilots. 6. Generate short-term wins with AI prototypes. "
            "7. Consolidate gains and drive deeper integration. 8. Anchor AI as part of organizational culture. "
            "Rule: Skipping a step causes regression to the previous stable state."
        ),
        "metaphor": "Leading a team of Victorian-era explorers into a magical, uncharted jungle",
        "domain_category": "strategy",
    },
    {
        "id": 35,
        "source": (
            "Global Supply Chain Predictive AI Maintenance: IoT sensors on factory machines continuously "
            "monitor vibration, temperature, and throughput. An AI model detects anomaly patterns and predicts "
            "failures before they occur. When a failure is predicted, the system automatically checks parts "
            "inventory and generates a purchase order if stock is low. "
            "Rule: A maintenance order cannot be issued without a confirmed anomaly prediction above the confidence threshold."
        ),
        "metaphor": "A Roman General (Legatus) maintaining the combat readiness of his legions in Britannia",
        "domain_category": "strategy",
    },
    {
        "id": 36,
        "source": (
            "Intelligence Cycle (OODA Loop): Observe — gather raw data from sensors and sources. "
            "Orient — analyze data, update mental model, consider cultural and environmental factors. "
            "Decide — select a course of action from available options. Act — execute the decision. "
            "The cycle repeats; faster cycle time creates competitive advantage. "
            "Rule: Acting without orienting leads to misapplied force."
        ),
        "metaphor": "A jazz quartet improvising on stage — listening, interpreting, choosing notes, and playing",
        "domain_category": "strategy",
    },
    {
        "id": 37,
        "source": (
            "Game Theory (Prisoner's Dilemma): Two players independently choose to cooperate or defect. "
            "Mutual cooperation yields moderate rewards for both. Mutual defection yields poor outcomes. "
            "If one defects while the other cooperates, the defector gets the highest payoff. In iterated games, "
            "tit-for-tat strategies encourage cooperation. "
            "Rule: In a single round, defection is always the dominant strategy regardless of the other player's choice."
        ),
        "metaphor": "Two neighboring gardeners deciding whether to share water or hoard it during a drought",
        "domain_category": "strategy",
    },

    # ─── Computer Science Theory (38-42) ──────────────────────────────────
    {
        "id": 38,
        "source": (
            "Relational Database Normalization: Data is organized into tables (relations). First Normal Form "
            "eliminates repeating groups. Second Normal Form removes partial dependencies. Third Normal Form "
            "removes transitive dependencies. Foreign keys link related tables. Joins reconstruct the data. "
            "Rule: A table in 3NF must have every non-key attribute depend on the key, the whole key, and nothing but the key."
        ),
        "metaphor": "An archivist organizing a royal family's genealogy into separate, cross-referenced scrolls",
        "domain_category": "cs_theory",
    },
    {
        "id": 39,
        "source": (
            "MapReduce: Input data is split into chunks. Map workers process each chunk independently, emitting "
            "key-value pairs. A shuffle phase groups values by key. Reduce workers aggregate grouped values into "
            "final results. The framework handles distribution, fault tolerance, and data locality. "
            "Rule: Map functions must be stateless — they cannot depend on the output of other map tasks."
        ),
        "metaphor": "An election night vote-counting operation across hundreds of polling stations",
        "domain_category": "cs_theory",
    },
    {
        "id": 40,
        "source": (
            "Garbage Collection (Mark-and-Sweep): The runtime maintains a set of root references. Starting from "
            "roots, the collector traverses all reachable objects, marking them as 'alive.' After marking, all "
            "unmarked objects are swept (freed). The process pauses application threads (stop-the-world). "
            "Rule: An object that is unreachable from any root reference will always be collected."
        ),
        "metaphor": "A lighthouse keeper walking the grounds after a storm, tagging every surviving plant and clearing debris",
        "domain_category": "cs_theory",
    },
    {
        "id": 41,
        "source": (
            "Compiler Pipeline: Source code is lexed into tokens. Tokens are parsed into an Abstract Syntax Tree (AST). "
            "Semantic analysis checks types and scopes. An intermediate representation (IR) is generated. "
            "The optimizer transforms IR for efficiency. Finally, a code generator emits machine code. "
            "Rule: Each phase can only consume the output of the previous phase."
        ),
        "metaphor": "A textile mill turning raw cotton into finished cloth — ginning, spinning, weaving, dyeing, pressing",
        "domain_category": "cs_theory",
    },
    {
        "id": 42,
        "source": (
            "Raft Consensus Algorithm: A cluster of servers elects a leader. The leader receives all client requests "
            "and replicates log entries to followers. A follower becomes a candidate if it doesn't hear from the leader "
            "within an election timeout. Candidates request votes; a majority wins the election. "
            "Rule: A server can vote for at most one candidate per term."
        ),
        "metaphor": "A pirate crew electing a captain — whoever gets the most votes commands the ship until challenged",
        "domain_category": "cs_theory",
    },

    # ─── Social Science & Psychology (43-46) ──────────────────────────────
    {
        "id": 43,
        "source": (
            "Maslow's Hierarchy of Needs: Humans prioritize physiological needs (food, water), then safety, "
            "then love/belonging, then esteem, and finally self-actualization. Lower needs must be substantially "
            "met before higher needs become motivating. Deprivation at any level redirects focus downward. "
            "Rule: Self-actualization cannot be pursued while basic physiological needs are unmet."
        ),
        "metaphor": "A mountain climber ascending base camp to summit — each camp must be established before advancing",
        "domain_category": "social_science",
    },
    {
        "id": 44,
        "source": (
            "Cognitive Dissonance Theory: When a person holds two conflicting beliefs or acts against a belief, "
            "they experience psychological discomfort. To reduce dissonance, they may change the belief, justify "
            "the behavior, or avoid information that intensifies the conflict. Stronger dissonance produces "
            "stronger motivation to resolve it. "
            "Rule: Dissonance can only be reduced by changing at least one of the conflicting cognitions."
        ),
        "metaphor": "Two magnets glued together at repelling poles — the structure vibrates until one magnet flips",
        "domain_category": "social_science",
    },
    {
        "id": 45,
        "source": (
            "Diffusion of Innovations: New technologies are adopted in stages — innovators (2.5%), early adopters "
            "(13.5%), early majority (34%), late majority (34%), laggards (16%). A 'chasm' exists between early "
            "adopters and the early majority. Crossing the chasm requires shifting from visionary to pragmatic messaging. "
            "Rule: The chasm must be crossed or the innovation fails to reach mainstream adoption."
        ),
        "metaphor": "A rumor spreading through a village — first the gossips, then the curious, then the cautious, then the skeptics",
        "domain_category": "social_science",
    },
    {
        "id": 46,
        "source": (
            "Operant Conditioning (Skinner): Behavior followed by reinforcement (positive or negative) increases. "
            "Behavior followed by punishment decreases. Variable-ratio reinforcement schedules produce the highest "
            "and most consistent response rates. Extinction occurs when reinforcement stops. "
            "Rule: Behavior that is never reinforced will eventually extinguish."
        ),
        "metaphor": "Training a falcon — rewarding dives with treats, ignoring lazy circles",
        "domain_category": "social_science",
    },

    # ─── Music & Arts (47-48) ─────────────────────────────────────────────
    {
        "id": 47,
        "source": (
            "Sonata Form (Classical Music): An exposition presents two contrasting themes in different keys. "
            "A development section fragments, modulates, and transforms the themes. A recapitulation restates "
            "both themes in the home key. Optional coda concludes the movement. "
            "Rule: The recapitulation must resolve the tonal tension by returning both themes to the tonic key."
        ),
        "metaphor": "A courtroom drama — the prosecution and defense present arguments, the jury weighs evidence, the judge delivers a verdict",
        "domain_category": "arts",
    },
    {
        "id": 48,
        "source": (
            "Color Theory (Subtractive Mixing): Primary colors (cyan, magenta, yellow) combine to produce secondaries. "
            "Mixing all three produces black (absorption of all light). Complementary colors are opposite on the wheel. "
            "Hue, saturation, and value define a color. Warm colors advance; cool colors recede. "
            "Rule: Mixing complementary colors neutralizes saturation, producing gray."
        ),
        "metaphor": "Three warring kingdoms whose armies, when merged, create shadow territories",
        "domain_category": "arts",
    },

    # ─── Ecology & Environment (49-50) ────────────────────────────────────
    {
        "id": 49,
        "source": (
            "Carbon Cycle: CO2 is absorbed from the atmosphere by plants via photosynthesis. Carbon moves through "
            "food chains to animals. Decomposition and respiration return CO2 to the atmosphere. Fossil fuel "
            "combustion releases stored carbon rapidly. Oceans absorb and release CO2, acting as a buffer. "
            "Rule: The total carbon in the system is conserved — it changes form but is never created or destroyed."
        ),
        "metaphor": "Gold coins circulating through a fantasy kingdom — minted, spent, melted, and re-minted",
        "domain_category": "ecology",
    },
    {
        "id": 50,
        "source": (
            "Predator-Prey Dynamics (Lotka-Volterra): Prey populations grow exponentially without predators. "
            "Predator populations grow when prey is abundant. As predators reduce prey, the predator population "
            "declines due to starvation. Reduced predation allows prey to recover, restarting the cycle. "
            "Rule: Neither population can go negative — a species driven to zero is extinct and cannot recover."
        ),
        "metaphor": "Two rival fan bases at a stadium — one side's cheering drowns out the other, then the energy shifts back",
        "domain_category": "ecology",
    },
]
