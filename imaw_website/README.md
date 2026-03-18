# ControlArc.com

The marketing website and interactive demo for the **Isomorphic Multi-Agent Workflow (IMAW)** — a Generative Control Architecture that prevents Semantic Leakage in AI-generated explanations.

**Live site:** [controlarc.com](https://controlarc.com)

## Stack

- **React** + **Vite** — Single-page application with hash-based routing
- **ReactMarkdown** + remark-gfm — Renders the research paper from `src/paper.md`
- **Vanilla CSS** + Tailwind utility classes — Styling

## Pages

| Route | Page |
|-------|------|
| `#` | Landing page — Hero, architecture diagram, use cases, Substack CTA |
| `#about` | About — What is Generative Control Architecture |
| `#paper` | Research paper — Full markdown render of the IMAW paper |
| `#workbench` | Workbench — Interactive CLI-style demo (desktop only) |

## Development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run build
# Output in dist/
```

## Related

- 📦 [IMAW Prototype](https://github.com/creativeAlgebra/imaw-prototype) — The CLI tool and Python library
- 📰 [Beyond the Context Window](https://beyondthecontextwindow.substack.com) — Research newsletter
