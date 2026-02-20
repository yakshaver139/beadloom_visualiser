# Requires: bd, jq
# Run from repo root

set -euo pipefail

EPIC_ID=$(
  bd create "Beadloom Graph Visualiser (React)" -t epic -p 1 -d \
  "Lightweight UI to display a Beadloom dependency graph and its already-computed Critical Path (CPA).
   - Frontend: React
   - Input: JSON payload via a small API endpoint (no DB)
   - No CPA computation required (API receives graph + CPA and UI renders it)." \
  --json | jq -r '.id'
)

# (Kept 'schema' slot but repurposed it to 'define the JSON schema / contract')
CONTRACT_ID=$(
  bd create "Define Beadloom graph JSON contract" -t task -p 1 -d \
  "Define the JSON format the app accepts/serves, e.g.:
   - nodes: [{id, title, status, ...}]
   - edges: [{from, to}]
   - critical_path: [nodeId...]
   - metadata: {project_name, generated_at, ...}
   Provide an example fixture JSON for dev/testing." \
  --parent "$EPIC_ID" --json | jq -r '.id'
)

API_ID=$(
  bd create "Build minimal API endpoint for graph JSON" -t task -p 1 -d \
  "Implement a tiny API that accepts (or serves) the Beadloom graph JSON:
   Options:
   - Next.js API route
   - Vite + small Node/Express server
   - Static JSON served with configurable path
   Requirements:
   - Validate payload shape (lightweight)
   - Provide /graph endpoint (GET and/or POST)" \
  --parent "$EPIC_ID" --json | jq -r '.id'
)

FE_ID=$(
  bd create "Build React UI for graph + CPA display" -t task -p 1 -d \
  "React app to render:
   - Dependency graph (nodes/edges)
   - Highlight critical path nodes/edges (provided in JSON)
   - Neat UI: zoom/pan, node detail drawer, filter by status
   Suggested libs: React Flow (or D3).
   Consumes /graph endpoint." \
  --parent "$EPIC_ID" --json | jq -r '.id'
)

DOCS_ID=$(
  bd create "Write usage docs" -t task -p 2 -d \
  "README:
   - How to run locally
   - JSON contract documentation
   - Example curl to POST a graph
   - Screenshot / short demo notes" \
  --parent "$EPIC_ID" --json | jq -r '.id'
)

TESTS_ID=$(
  bd create "Integration tests (API + UI)" -t task -p 1 -d \
  "Basic integration coverage:
   - API serves/accepts fixture JSON
   - UI loads fixture and renders nodes/edges
   - CPA highlighting shown for expected nodes
   Tools: Playwright/Cypress (UI) + simple API tests." \
  --parent "$EPIC_ID" --json | jq -r '.id'
)

DEPLOY_ID=$(
  bd create "Deploy pipeline" -t task -p 2 -d \
  "CI:
   - lint + typecheck
   - run tests
   - build
   Deploy to a simple host (e.g. Vercel/Netlify/Fly static).
   Ensure environment config for graph endpoint." \
  --parent "$EPIC_ID" --json | jq -r '.id'
)

# Dependencies (same structure as your original)
bd dep add "$API_ID" "$CONTRACT_ID"
bd dep add "$FE_ID" "$CONTRACT_ID"
bd dep add "$DOCS_ID" "$API_ID"
bd dep add "$TESTS_ID" "$API_ID"
bd dep add "$TESTS_ID" "$FE_ID"
bd dep add "$DEPLOY_ID" "$TESTS_ID"

echo "Created epic: $EPIC_ID"
bd dep tree "$EPIC_ID" --direction=both

