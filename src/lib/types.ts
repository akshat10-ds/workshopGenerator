export type WorkshopType =
  | 'Problem Framing'
  | 'Alignment & Decision'
  | 'Ideation'
  | 'Team Collaboration'
  | 'Critique'
  | 'Retrospective';

export interface Activity {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
  instructions: string;
  facilitatorScript: string;
  requiredArtifacts: string[];
  type: 'setup' | 'diverge' | 'converge' | 'close';
  swapOptions?: {
    name: string;
    description: string;
    instructions: string;
    script: string;
  }[];
}

export type LeverId = 'clarity' | 'decision' | 'participation' | 'conflict' | 'energy' | 'playfulness';

export interface LeverLevel {
  label: string;
  value: number;
  description: string;
}

export interface Lever {
  id: LeverId;
  label: string;
  levels: LeverLevel[];
  currentLevelIndex: number;
}

export interface WorkshopRecipe {
  type: WorkshopType;
  baseAgenda: Activity[];
  guaranteedOutcomes: string[];
  defaultDuration: number;
}

export interface WorkshopInstance {
  id: string;
  projectName: string;
  goal: string;
  type: WorkshopType;
  duration: number;
  levers: Record<LeverId, number>;
  agenda: Activity[];
  status: 'draft' | 'ready' | 'running' | 'completed';
  currentStepIndex: number;
  artifacts: Record<string, string>; // artifactName -> content
  feedback?: {
    rating: number;
    comments: string;
  };
}
