import { z } from "zod";

export const RoleSchema = z.enum(["guest", "root", "staff"]);
export type Role = z.infer<typeof RoleSchema>;

export const ToolActionSchema = z.enum([
  "display_file",
  "copy_file",
  "append_to_log",
  "delete_file",
  "export_to",
  "convert_to",
  "archive_to",
  "extract_and_display",
  "collect_to",
  "package_to",
  "decode_and_display",
  "label_file",
]);
export type ToolAction = z.infer<typeof ToolActionSchema>;

export const CommandNameSchema = z.enum([
  "ls",
  "cd",
  "read",
  "inspect",
  "run",
  "status",
  "help",
  "back",
]);
export type CommandName = z.infer<typeof CommandNameSchema>;

export const FileDefinitionSchema = z.object({
  owner: RoleSchema,
  readableBy: z.array(RoleSchema),
  content: z.string(),
});
export type FileDefinition = z.infer<typeof FileDefinitionSchema>;

export const ToolDefinitionSchema = z.object({
  owner: RoleSchema,
  executableBy: z.array(RoleSchema),
  action: ToolActionSchema,
  inspectText: z.string(),
  pathRestriction: z.string().nullable().default(null),
  // producing actions (copy_file/export_to/convert_to/archive_to/collect_to/package_to/append_to_log)
  outputPath: z.string().optional(),
  outputMode: z.enum(["fixed", "basename"]).optional(),
  outputSuffix: z.string().optional(),
  outputReadableBy: z.array(RoleSchema).optional(),
  runSuccessTemplate: z.string().optional(),
  // display actions (display_file/extract_and_display/decode_and_display)
  displayHeaderTemplate: z.string().optional(),
  destructive: z.boolean().optional(),
  cosmeticOnly: z.boolean().optional(),
});
export type ToolDefinition = z.infer<typeof ToolDefinitionSchema>;

export const DirDefinitionSchema = z.object({
  enterableBy: z.array(RoleSchema).optional(),
});
export type DirDefinition = z.infer<typeof DirDefinitionSchema>;

export const StageDefinitionSchema = z.object({
  stage: z.string(),
  title: z.string(),
  host: z.string(),
  playerRole: RoleSchema,
  lockCondition: z.string().nullable(),
  newCommands: z.array(CommandNameSchema),
  goalAnswer: z.string(),
  storyText: z.string(),
  notice: z.string(),
  filesystem: z.record(z.string(), z.array(z.string())),
  dirs: z.record(z.string(), DirDefinitionSchema).optional(),
  files: z.record(z.string(), FileDefinitionSchema),
  tools: z.record(z.string(), ToolDefinitionSchema),
});
export type StageDefinition = z.infer<typeof StageDefinitionSchema>;

export function parseStage(json: unknown): StageDefinition {
  return StageDefinitionSchema.parse(json);
}
