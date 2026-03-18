# The Poetry Problem: What Flatland Teaches Us About the Limits of Abstraction

*By Randall Garcia — Reflections | March 2026*

When I published the Isomorphic Multi-Agent Workflow (IMAW) paper, the central thesis was simple but absolute: Large Language Models hallucinate because they process *structure* and *expression* simultaneously in a flat probabilistic space. If you want an agent to reason reliably, you have to separate the two. You must force the agent into "Contextual Blindness"—extracting the underlying structural logic of a system before mapping it to a new domain.

By turning analogy into an engineering discipline—one that is explicit, separable, and auditable—IMAW forces structural integrity into an inspectable state, allowing Human-in-the-Loop validation before final translation. 

Recently, a colleague reviewed the paper and offered a profound challenge. They noted that my system works perfectly for technical domains because the structure is invariant. But what happens when you abstract a domain where *expression partly constitutes the structure*?

Let's call this the "Poetry Problem", and it defines the exact boundary of what IMAW was built to do.

---

## The Aesthetic Threshold

Consider Edwin A. Abbott's 1884 novella, *Flatland: A Romance of Many Dimensions*.

On the surface, *Flatland* is a book about geometry. It operates in a two-dimensional world inhabited by geometric shapes. Women are straight lines, soldiers are isosceles triangles, gentlemen are equilateral triangles, and the ruling priets are circles. The book explains geometric properties and the difficulty of perceiving a third dimension (the "Z-axis").

If we passed *Flatland* through the IMAW pipeline, the **Decomposition Agent** would read the text and extract the pure structural logic:
> *Entities possess increasing numbers of sides. Entities with more sides hold power over entities with fewer sides. Entities in 2D space cannot perceive 3D space.*

The **Mapping Agent** could then faithfully map this geometry onto a new domain—perhaps a metaphor about software architecture or database clusters. The **Synthesis Agent** would output a brilliant, logically perfect story about how microservices cannot perceive the overarching cloud infrastructure.

**And the pipeline would have completely destroyed the book.**

Because *Flatland* isn't actually a book about geometry. The geometric constraints—the "expression"—were an intricate, biting satire of the rigid, sexist, and fiercely hierarchical class system of Victorian England. The expression *was* the structure. 

If you strip away the Victorian context to find the "pure math," the art dies in the process.

## Didactic vs. Affective Pedagogy

This critique forced me to draw a sharp line around the capabilities of Generative Control Architecture. 

When you translate technical documentation (like Kubernetes or a Supply Chain), you are engaging in **Didactic Pedagogy**. The goal is mechanical understanding. The expression (jargon, variable names) is an obstacle to learning; removing it clarifies the structure.

But when you encounter poetry, philosophy, religion, or literature, you are engaging in **Affective Pedagogy**. The rhythm of a Shakespearean sonnet, the cultural weight of a religious text, or the Victorian satire of *Flatland* cannot be abstracted into a JSON schema without destroying its soul. In art, you cannot physically separate what is being said from *how* it is being said.

## Engineering the Boundary

IMAW was never meant to be an artist. It is a control architecture for ensuring that an agent can teach you how a Database works without hallucinating magical properties into the PostgreSQL schema. 

This realization actually solidifies my pursuit of "Contextual Blindness." By explicitly acknowledging that my framework will systematically fail at translating poetry or subtle cultural satire, I can optimize it relentlessly for what it does best: turning opaque, complex technical architectures into transparent, intuitive, and auditable knowledge systems.

Ultimately, recognizing where an abstraction breaks is just as important as building the abstraction itself.
