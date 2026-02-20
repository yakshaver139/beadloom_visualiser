import { z } from "zod";

// ---------------------------------------------------------------------------
// Loom Plan – the raw JSON produced by `bd loom` / beadloom orchestrator.
// This is the **input** contract: the visualiser accepts this format.
// ---------------------------------------------------------------------------

export const TaskSchema = z.object({
  task_id: z.string(),
  title: z.string(),
  is_critical: z.boolean(),
  worktree_name: z.string(),
  branch_name: z.string(),
  prompt: z.string(),
  worktree_path: z.string(),
  wave_index: z.number().int().nonnegative(),
});

export type Task = z.infer<typeof TaskSchema>;

export const WaveSchema = z.object({
  index: z.number().int().nonnegative(),
  tasks: z.array(TaskSchema).min(1),
  depends_on: z.array(z.number().int().nonnegative()).nullable(),
});

export type Wave = z.infer<typeof WaveSchema>;

export const DepsSchema = z.object({
  predecessors: z.record(z.string(), z.array(z.string()).nullable()),
  successors: z.record(z.string(), z.array(z.string()).nullable()),
});

export type Deps = z.infer<typeof DepsSchema>;

export const ConfigSchema = z.object({
  max_parallel: z.number().int().positive(),
  safe: z.boolean(),
  timeout_per_task: z.string(),
  worktree_dir: z.string(),
  prompt_template_path: z.string(),
  db_path: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;

export const LoomPlanSchema = z.object({
  id: z.string(),
  created_at: z.string().datetime({ offset: true }),
  total_tasks: z.number().int().nonnegative(),
  total_waves: z.number().int().nonnegative(),
  critical_path: z.array(z.string()),
  waves: z.array(WaveSchema),
  tasks: z.record(z.string(), TaskSchema),
  deps: DepsSchema,
  config: ConfigSchema,
});

export type LoomPlan = z.infer<typeof LoomPlanSchema>;
