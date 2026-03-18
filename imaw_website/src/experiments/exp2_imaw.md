# Experiment A: IMAW 3-Agent Pipeline Output (Supply Chain)

### Decomposed Schema (Agent 1)
```json
{
  "entities": [
    "Data Source",
    "Data Repository",
    "Processing Node",
    "Resource Catalog",
    "Operational Unit",
    "External Supplier",
    "Instruction Set",
    "Request Signal",
    "Resource"
  ],
  "relationships": [
    {
      "source_entity": "Data Source",
      "target_entity": "Data Repository",
      "interaction": "transmits data to"
    },
    {
      "source_entity": "Processing Node",
      "target_entity": "Data Repository",
      "interaction": "monitors data from"
    },
    {
      "source_entity": "Processing Node",
      "target_entity": "Resource Catalog",
      "interaction": "queries for Resource status"
    },
    {
      "source_entity": "Processing Node",
      "target_entity": "Instruction Set",
      "interaction": "generates"
    },
    {
      "source_entity": "Processing Node",
      "target_entity": "Operational Unit",
      "interaction": "assigns Instruction Set to"
    },
    {
      "source_entity": "Processing Node",
      "target_entity": "External Supplier",
      "interaction": "sends Request Signal to"
    },
    {
      "source_entity": "Operational Unit",
      "target_entity": "Data Source",
      "interaction": "performs action on"
    },
    {
      "source_entity": "External Supplier",
      "target_entity": "Resource Catalog",
      "interaction": "provides Resource to"
    }
  ],
  "rules": [
    "The Processing Node must establish a baseline state from the data within the Data Repository.",
    "An action is triggered only when the Processing Node detects a deviation from the established baseline.",
    "Upon detecting a deviation, the Processing Node must first query the Resource Catalog for a specific Resource.",
    "If the required Resource is available in the Resource Catalog, the Processing Node generates an Instruction Set and assigns it to an Operational Unit.",
    "If the required Resource is not available in the Resource Catalog, the Processing Node sends a Request Signal to the External Supplier.",
    "An Operational Unit cannot act on a Data Source without receiving an Instruction Set.",
    "A Request Signal can only be sent if the Resource Catalog confirms the absence of the required Resource."
  ]
}
```

### Isomorphic Mapping (Agent 2)
```json
{
  "entity_mappings": [
    {
      "abstract_entity": "Data Source",
      "metaphorical_entity": "Frontier Garrison"
    },
    {
      "abstract_entity": "Data Repository",
      "metaphorical_entity": "Scout Reports Ledger"
    },
    {
      "abstract_entity": "Processing Node",
      "metaphorical_entity": "Legatus"
    },
    {
      "abstract_entity": "Resource Catalog",
      "metaphorical_entity": "Castra Armory Inventory"
    },
    {
      "abstract_entity": "Operational Unit",
      "metaphorical_entity": "Field Tribune"
    },
    {
      "abstract_entity": "External Supplier",
      "metaphorical_entity": "Provincial Fabrica"
    },
    {
      "abstract_entity": "Instruction Set",
      "metaphorical_entity": "Sealed Papyrus Order"
    },
    {
      "abstract_entity": "Request Signal",
      "metaphorical_entity": "Requisition Missive"
    },
    {
      "abstract_entity": "Resource",
      "metaphorical_entity": "Armamenta"
    }
  ],
  "translated_rules": [
    "The Legatus must establish a baseline combat readiness from the intelligence within the Scout Reports Ledger.",
    "A response is triggered only when the Legatus detects a deviation from the established combat readiness.",
    "Upon detecting a deviation, the Legatus must first query the Castra Armory Inventory for specific Armamenta.",
    "If the required Armamenta is available in the Castra Armory Inventory, the Legatus generates a Sealed Papyrus Order and assigns it to a Field Tribune.",
    "If the required Armamenta is not available in the Castra Armory Inventory, the Legatus sends a Requisition Missive to the Provincial Fabrica.",
    "A Field Tribune cannot act on a Frontier Garrison without receiving a Sealed Papyrus Order.",
    "A Requisition Missive can only be sent if the Castra Armory Inventory confirms the absence of the required Armamenta."
  ]
}
```

### Final Lesson (Agent 3)
---

# The Legatus's Foresight: Maintaining Rome's Edge in Britannia

Welcome, student of strategy. Today, we will study how a brilliant Roman **Legatus** (a General) can maintain the fighting trim of his legions scattered across the hostile, misty frontiers of Britannia. His goal is not to win battles, but to prevent his army from ever being caught unprepared—a far more profound victory. This system of proactive command is the key to imperial stability.

---

### Step 1: The Eyes and Ears of the Frontier

Imagine the vast, untamed wilderness of Britannia. To hold this land, Rome has established numerous **Frontier Garrisons**—forts and watchtowers that are the Empire's first line of defense. These are our **Data Sources**.

From each **Frontier Garrison**, scouts are dispatched day and night. They don't just report on enemy movements. They send a constant stream of intelligence back to the Legatus's command tent concerning the condition of the garrison's shields, the sharpness of their swords, and the morale of the men. Every detail is meticulously recorded by scribes into a master document: the **Scout Reports Ledger**. This ledger is our central **Data Repository**, a single source of truth for the entire provincial army.

### Step 2: Establishing the "Rhythm of the Legion"

Our commander, the **Legatus**, is the system's **Processing Node**. He is a veteran of a hundred campaigns. He pours over the **Scout Reports Ledger** daily, not just reading the words but understanding the patterns. He learns the unique "personality" of each garrison—how quickly the cohorts at Fort Deva wear out their sandals on the training grounds, or the normal rate of wear on the ballistae at Eboracum.

From this deep analysis of the intelligence in the **Scout Reports Ledger**, the **Legatus** establishes a baseline for perfect combat readiness. He knows what "normal" looks like for every single unit under his command.

### Step 3: Sensing Weakness Before It Breaks

One morning, the **Legatus** is reviewing the ledger and notices a subtle deviation. The reports from the garrison at Vercovicium show their shields are losing integrity 5% faster than his established baseline. To an untrained eye, this is nothing. To the **Legatus**, it is a premonition of disaster. He knows from experience that this specific type of wear, if left unchecked, precedes a catastrophic shield wall failure in battle. A response is triggered only by this deviation from established combat readiness.

### Step 4: Consulting the Armory

Having predicted a future failure, the **Legatus** does not immediately send out riders. His first, disciplined action is to consult his quartermaster's scrolls—the **Castra Armory Inventory** (our **Resource Catalog**). He must know if the specific **Armamenta** (**Resource**) required—in this case, a consignment of seasoned replacement shields—is available in his central camp's stores.

### The Fork in the Path: Two Scenarios

The next action of the **Legatus** depends entirely on the answer from the **Castra Armory Inventory**.

#### Scenario A: The Resource is At Hand

The inventory confirms a surplus of the required shields. The **Legatus** immediately takes a fresh sheet of papyrus and dictates a **Sealed Papyrus Order** (our **Instruction Set**). This order contains precise instructions: "Take twenty replacement shields of the Vercovicium pattern and deliver them to the garrison commander for immediate refitting."

He seals the order with his signet ring and hands it to a **Field Tribune** (our **Operational Unit**), a trusted officer responsible for carrying out such vital tasks. The **Field Tribune** cannot, and will not, act on the **Frontier Garrison** without this specific, sealed order. He and his men ride out to preemptively fix the weakness before it can be exploited by the enemy.

#### Scenario B: The Resource is Depleted

The inventory check reveals a critical shortage. The required shields are not in the camp's armory. Only after the **Castra Armory Inventory** confirms the absence of the required **Armamenta** does the **Legatus** proceed to the next step.

He pens a different type of document: a **Requisition Missive** (our **Request Signal**). This is an urgent request for materiel, dispatched by the fastest courier not to a local fort, but to the massive, state-run **Provincial Fabrica** (our **External Supplier**) in the south. The missive commands the fabrica to produce and rush the needed **Armamenta** to the frontier, ensuring the legion is re-equipped from the heart of the Empire itself.

---

### Conclusion: The Doctrine of Proactive Readiness

The Legatus's genius is not in his reaction to a crisis, but in the very structure that prevents the crisis from ever occurring. By using a constant flow of intelligence, a central processing mind that understands the baseline of "normal," and a clear, automated set of rules for dispatching internal resources or requisitioning external ones, he ensures the shield wall of Rome never breaks. This is the essence of a truly predictive and resilient system.