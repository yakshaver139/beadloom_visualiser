# beadloom_visualiser

Web application for visualising Beadloom dependency graphs and their critical path analysis. The Beadloom orchestrator (`bd loom`) produces a structured LoomPlan JSON describing parallel task waves, dependencies, and the critical path. This app accepts that JSON via a REST API and renders it as an interactive graph with critical-path highlighting.

## Quick start

```bash
# Install dependencies
npm install

# Start the dev server (default: http://localhost:3001)
npm run dev

# Override port
PORT=4000 npm run dev
```

## Available scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `npx tsx src/server/index.ts` | Start the API server |
| `npm test` | `vitest run` | Run all tests once |
| `npm run test:watch` | `vitest` | Run tests in watch mode |
| `npm run typecheck` | `tsc --noEmit` | Type-check without emitting |

## API

### `POST /graph`

Submit a LoomPlan. The server validates the payload, transforms it into a normalised Graph, stores it in memory, and returns the result.

- **201** — Graph created successfully (returns `Graph` JSON)
- **400** — Invalid payload (returns Zod validation errors)

### `GET /graph`

Retrieve the currently loaded graph.

- **200** — Returns the stored `Graph` JSON
- **404** — No graph loaded yet (`{ "error": "No graph loaded. POST a LoomPlan first." }`)

### Example: submit a graph

```bash
curl -X POST http://localhost:3001/graph \
  -H "Content-Type: application/json" \
  -d @src/fixtures/sample-loom-plan.json
```

### Example: retrieve the graph

```bash
curl http://localhost:3001/graph
```

## JSON contract

### Input: LoomPlan

The payload accepted by `POST /graph`. This is the output of `bd loom`.

```jsonc
{
  "id": "loom-2026-02-20-124321",           // unique plan identifier
  "created_at": "2026-02-20T12:43:21.610Z", // ISO-8601 datetime
  "total_tasks": 6,                          // task count (>= 0)
  "total_waves": 4,                          // wave count (>= 0)
  "critical_path": ["task-1", "task-3"],     // ordered task_ids on the critical path

  "waves": [
    {
      "index": 0,                            // wave position (>= 0)
      "tasks": [                             // at least one task per wave
        {
          "task_id": "task-1",
          "title": "Define schema",
          "is_critical": true,
          "worktree_name": "task-1",
          "branch_name": "feature/task-1",
          "prompt": "Define the JSON schema.",
          "worktree_path": ".worktrees/task-1",
          "wave_index": 0
        }
      ],
      "depends_on": null                     // wave indices this wave depends on, or null
    }
  ],

  "tasks": {                                 // task_id -> Task lookup
    "task-1": { /* same Task shape as above */ }
  },

  "deps": {
    "predecessors": {                        // task_id -> [dependency task_ids] | null
      "task-1": null,
      "task-2": ["task-1"]
    },
    "successors": {                          // task_id -> [dependent task_ids] | null
      "task-1": ["task-2"],
      "task-2": null
    }
  },

  "config": {
    "max_parallel": 4,                       // max concurrent tasks (> 0)
    "safe": false,                           // safe-mode flag
    "timeout_per_task": "30m",               // per-task timeout
    "worktree_dir": ".worktrees",
    "prompt_template_path": "",
    "db_path": ""
  }
}
```

### Output: Graph

The normalised format returned by both endpoints and consumed by the React frontend.

```jsonc
{
  "nodes": [
    {
      "id": "task-1",                        // = task_id
      "title": "Define schema",
      "status": "pending",                   // "pending" | "in_progress" | "completed" | "blocked"
      "is_critical": true,
      "wave_index": 0,
      "branch_name": "feature/task-1"
    }
  ],
  "edges": [
    {
      "from": "task-1",                      // predecessor task_id
      "to": "task-2"                         // successor task_id
    }
  ],
  "critical_path": ["task-1", "task-3"],     // passed through from LoomPlan
  "metadata": {
    "id": "loom-2026-02-20-124321",
    "created_at": "2026-02-20T12:43:21.610Z",
    "total_tasks": 6,
    "total_waves": 4
  }
}
```

## Project structure

```
src/
├── fixtures/
│   └── sample-loom-plan.json        # Dev/test fixture
├── schema/
│   ├── loom-plan.ts                 # Zod schema for LoomPlan input
│   ├── graph.ts                     # Zod schema for Graph output
│   ├── transform.ts                 # toGraph(): LoomPlan -> Graph
│   ├── index.ts                     # Re-exports
│   └── __tests__/
│       ├── loom-plan.test.ts        # LoomPlan validation tests
│       └── graph.test.ts            # Graph transform tests
└── server/
    ├── app.ts                       # Express app + routes
    ├── index.ts                     # Server entrypoint
    └── __tests__/
        └── graph-api.test.ts        # API integration tests
```

## Demo notes

1. Start the server with `npm run dev`
2. POST the sample fixture: `curl -X POST http://localhost:3001/graph -H "Content-Type: application/json" -d @src/fixtures/sample-loom-plan.json`
3. Open the React UI (once available) to see the rendered dependency graph with critical-path nodes highlighted
4. Alternatively, inspect the API response directly: `curl http://localhost:3001/graph | jq .`

The graph displays task nodes grouped by wave, connected by dependency edges, with critical-path nodes visually distinguished.
