export type GateType = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR';

export const ALL_GATES: readonly GateType[] = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

export type SignalSource =
  | { kind: 'input'; index: number }
  | { kind: 'slot'; index: number };

export interface GateSlot {
  inputs: readonly [SignalSource, SignalSource];
  outputLabel: string;
}

export interface GateGridTier {
  name: 'Beginner' | 'Intermediate' | 'Expert';
  inputCount: number;
  inputLabels: readonly string[];
  slots: readonly GateSlot[];
  palette: readonly GateType[];
}

export const DIFFICULTIES: GateGridTier[] = [
  {
    name: 'Beginner',
    inputCount: 2,
    inputLabels: ['A', 'B'],
    slots: [
      {
        inputs: [{ kind: 'input', index: 0 }, { kind: 'input', index: 1 }],
        outputLabel: 'Out',
      },
    ],
    palette: ['AND', 'OR'],
  },
  {
    name: 'Intermediate',
    inputCount: 3,
    inputLabels: ['A', 'B', 'C'],
    slots: [
      {
        inputs: [{ kind: 'input', index: 0 }, { kind: 'input', index: 1 }],
        outputLabel: 'X',
      },
      {
        inputs: [{ kind: 'slot', index: 0 }, { kind: 'input', index: 2 }],
        outputLabel: 'Out',
      },
    ],
    palette: ['AND', 'OR', 'XOR'],
  },
  {
    name: 'Expert',
    inputCount: 4,
    inputLabels: ['A', 'B', 'C', 'D'],
    slots: [
      {
        inputs: [{ kind: 'input', index: 0 }, { kind: 'input', index: 1 }],
        outputLabel: 'X',
      },
      {
        inputs: [{ kind: 'input', index: 2 }, { kind: 'input', index: 3 }],
        outputLabel: 'Y',
      },
      {
        inputs: [{ kind: 'slot', index: 0 }, { kind: 'slot', index: 1 }],
        outputLabel: 'Out',
      },
    ],
    palette: ['AND', 'OR', 'XOR', 'NAND', 'NOR'],
  },
];

export interface SlotState {
  gate: GateType | null;
  wireInverts: readonly [boolean, boolean];
}
export type CircuitAssignment = SlotState[];

export function emptyAssignment(tier: GateGridTier): CircuitAssignment {
  return tier.slots.map(() => ({ gate: null, wireInverts: [false, false] as const }));
}

function applyGate(gate: GateType, a: boolean, b: boolean): boolean {
  switch (gate) {
    case 'AND': return a && b;
    case 'OR': return a || b;
    case 'XOR': return a !== b;
    case 'NAND': return !(a && b);
    case 'NOR': return !(a || b);
  }
}

export function evaluateCircuit(
  tier: GateGridTier,
  assignment: CircuitAssignment,
  inputs: boolean[]
): boolean | null {
  const slotOutputs: boolean[] = [];
  for (let i = 0; i < tier.slots.length; i++) {
    const state = assignment[i];
    if (!state.gate) return null;
    const resolve = (src: SignalSource) =>
      src.kind === 'input' ? inputs[src.index] : slotOutputs[src.index];
    const [srcA, srcB] = tier.slots[i].inputs;
    const a = state.wireInverts[0] ? !resolve(srcA) : resolve(srcA);
    const b = state.wireInverts[1] ? !resolve(srcB) : resolve(srcB);
    slotOutputs[i] = applyGate(state.gate, a, b);
  }
  return slotOutputs[tier.slots.length - 1];
}

export function isCircuitComplete(assignment: CircuitAssignment): boolean {
  return assignment.every(s => s.gate !== null);
}

export function inputsForRow(tier: GateGridTier, row: number): boolean[] {
  return Array.from({ length: tier.inputCount }, (_, i) => Boolean((row >> i) & 1));
}

export function deriveTruthTable(tier: GateGridTier, assignment: CircuitAssignment): boolean[] {
  const rows = 1 << tier.inputCount;
  return Array.from({ length: rows }, (_, row) => evaluateCircuit(tier, assignment, inputsForRow(tier, row))!);
}

function randomAssignment(tier: GateGridTier): CircuitAssignment {
  return tier.slots.map(() => ({
    gate: tier.palette[Math.floor(Math.random() * tier.palette.length)],
    wireInverts: [Math.random() < 0.5, Math.random() < 0.5] as const,
  }));
}

export interface GateGridPuzzle {
  tierIndex: number;
  targetTable: boolean[];
}

export function generatePuzzle(tierIndex: number): GateGridPuzzle {
  const tier = DIFFICULTIES[tierIndex];
  let targetTable: boolean[] = [];
  for (let attempt = 0; attempt < 200; attempt++) {
    targetTable = deriveTruthTable(tier, randomAssignment(tier));
    const allTrue = targetTable.every(v => v);
    const allFalse = targetTable.every(v => !v);
    if (!allTrue && !allFalse) break;
  }
  return { tierIndex, targetTable };
}

export function checkSolution(
  tier: GateGridTier,
  assignment: CircuitAssignment,
  targetTable: boolean[]
): { solved: boolean; failingRows: number[] } {
  const failingRows: number[] = [];
  for (let row = 0; row < targetTable.length; row++) {
    if (evaluateCircuit(tier, assignment, inputsForRow(tier, row)) !== targetTable[row]) {
      failingRows.push(row);
    }
  }
  return { solved: failingRows.length === 0, failingRows };
}

export function sourceLabel(tier: GateGridTier, src: SignalSource): string {
  return src.kind === 'input' ? tier.inputLabels[src.index] : tier.slots[src.index].outputLabel;
}
