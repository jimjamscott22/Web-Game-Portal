import { useCallback, useMemo, useState } from 'react';
import {
  DIFFICULTIES,
  emptyAssignment,
  evaluateCircuit,
  generatePuzzle,
  inputsForRow,
  isCircuitComplete,
  checkSolution,
  sourceLabel,
  type CircuitAssignment,
  type GateGridPuzzle,
  type GateType,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import WinOverlay from '@/components/WinOverlay';

const GATE_GRID_COLOR = '#2ED8A7';

interface WireBadgeProps {
  label: string;
  inverted: boolean;
  onToggleInvert: () => void;
}

function WireBadge({ label, inverted, onToggleInvert }: WireBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={onToggleInvert}
        title="Toggle invert"
        className={`w-4 h-4 rounded-full border-[2px] border-dark transition-colors ${
          inverted ? 'bg-dark' : 'bg-white hover:bg-gray-100'
        }`}
      />
      <span className="px-2 py-1 bg-white border-[2px] border-dark rounded-tile font-pixel text-sm">
        {label}
      </span>
    </span>
  );
}

export default function BoardGateGrid() {
  const [tierIndex, setTierIndex] = useState(0);
  const tier = DIFFICULTIES[tierIndex];
  const [puzzle, setPuzzle] = useState<GateGridPuzzle>(() => generatePuzzle(0));
  const [assignment, setAssignment] = useState<CircuitAssignment>(() => emptyAssignment(DIFFICULTIES[0]));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const newPuzzle = useCallback((idx: number) => {
    const nextTier = DIFFICULTIES[idx];
    setTierIndex(idx);
    setPuzzle(generatePuzzle(idx));
    setAssignment(emptyAssignment(nextTier));
    setSelectedSlot(null);
  }, []);

  const assignGate = useCallback((gate: GateType) => {
    setSelectedSlot(current => {
      if (current === null) return current;
      setAssignment(prev => prev.map((s, i) => (i === current ? { ...s, gate } : s)));
      return current;
    });
  }, []);

  const assignGateByPaletteIndex = useCallback((idx: number) => {
    const gate = tier.palette[idx];
    if (!gate) return;
    assignGate(gate);
  }, [tier, assignGate]);

  const toggleInvert = useCallback((slotIndex: number, wireIndex: 0 | 1) => {
    setAssignment(prev =>
      prev.map((s, i) => {
        if (i !== slotIndex) return s;
        const wireInverts: [boolean, boolean] = [s.wireInverts[0], s.wireInverts[1]];
        wireInverts[wireIndex] = !wireInverts[wireIndex];
        return { ...s, wireInverts };
      })
    );
  }, []);

  const toggleSelectedInvert = useCallback((wireIndex: 0 | 1) => {
    setSelectedSlot(current => {
      if (current === null) return current;
      toggleInvert(current, wireIndex);
      return current;
    });
  }, [toggleInvert]);

  const liveOutputs = useMemo(
    () =>
      Array.from({ length: 1 << tier.inputCount }, (_, row) =>
        evaluateCircuit(tier, assignment, inputsForRow(tier, row))
      ),
    [tier, assignment]
  );

  const isComplete = useMemo(() => isCircuitComplete(assignment), [assignment]);
  const checkResult = useMemo(
    () => (isComplete ? checkSolution(tier, assignment, puzzle.targetTable) : null),
    [isComplete, tier, assignment, puzzle]
  );
  const solved = checkResult?.solved ?? false;
  const failingRows = checkResult?.failingRows ?? [];

  useKeyboard(
    {
      arrowup: () => setSelectedSlot(s => (s === null ? 0 : Math.max(0, s - 1))),
      arrowdown: () => setSelectedSlot(s => (s === null ? 0 : Math.min(tier.slots.length - 1, s + 1))),
      '1': () => assignGateByPaletteIndex(0),
      '2': () => assignGateByPaletteIndex(1),
      '3': () => assignGateByPaletteIndex(2),
      '4': () => assignGateByPaletteIndex(3),
      '5': () => assignGateByPaletteIndex(4),
      q: () => toggleSelectedInvert(0),
      w: () => toggleSelectedInvert(1),
    },
    [tier, assignGateByPaletteIndex, toggleSelectedInvert]
  );

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex gap-2 flex-wrap justify-center">
        {DIFFICULTIES.map((t, idx) => (
          <button
            key={t.name}
            onClick={() => newPuzzle(idx)}
            className={`font-pixel text-xs px-3 py-1.5 rounded-pill border-[2px] border-dark transition-all ${
              tierIndex === idx ? 'text-white' : 'bg-white text-dark hover:bg-gray-100'
            }`}
            style={tierIndex === idx ? { backgroundColor: GATE_GRID_COLOR } : undefined}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-[520px] bg-white rounded-card border-[4px] border-dark p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          {tier.slots.map((slot, i) => {
            const state = assignment[i];
            const isSelected = selectedSlot === i;
            return (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <WireBadge
                  label={sourceLabel(tier, slot.inputs[0])}
                  inverted={state.wireInverts[0]}
                  onToggleInvert={() => toggleInvert(i, 0)}
                />
                <button
                  onClick={() => setSelectedSlot(i)}
                  className={`min-w-[64px] h-10 px-3 rounded-tile border-[3px] border-dark font-pixel text-sm flex items-center justify-center transition-all ${
                    isSelected ? 'text-white' : 'bg-white text-dark hover:bg-gray-100'
                  }`}
                  style={isSelected ? { backgroundColor: GATE_GRID_COLOR } : undefined}
                >
                  {state.gate ?? '?'}
                </button>
                <WireBadge
                  label={sourceLabel(tier, slot.inputs[1])}
                  inverted={state.wireInverts[1]}
                  onToggleInvert={() => toggleInvert(i, 1)}
                />
                <span className="font-pixel text-dark">=</span>
                <span className="px-2 py-1 bg-white border-[2px] border-dark rounded-tile font-pixel text-sm">
                  {slot.outputLabel}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-pixel text-sm text-dark">
            Gates {selectedSlot === null ? '(select a slot above)' : ''}
          </p>
          <div className="flex gap-2 flex-wrap">
            {tier.palette.map((gate, idx) => {
              const isActive = selectedSlot !== null && assignment[selectedSlot]?.gate === gate;
              return (
                <button
                  key={gate}
                  onClick={() => assignGate(gate)}
                  disabled={selectedSlot === null}
                  className={`px-4 py-2 rounded-tile border-[3px] border-dark font-pixel text-sm transition-all ${
                    isActive ? 'text-white' : 'bg-white text-dark hover:bg-gray-100'
                  } ${selectedSlot === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={isActive ? { backgroundColor: GATE_GRID_COLOR } : undefined}
                  title={`Assign (key ${idx + 1})`}
                >
                  {gate}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="font-pixel text-sm border-collapse mx-auto">
            <thead>
              <tr>
                {tier.inputLabels.map(label => (
                  <th key={label} className="border-[2px] border-dark px-3 py-1 bg-white">
                    {label}
                  </th>
                ))}
                <th className="border-[2px] border-dark px-3 py-1 bg-white">Target</th>
                <th className="border-[2px] border-dark px-3 py-1 bg-white">Your Output</th>
              </tr>
            </thead>
            <tbody>
              {puzzle.targetTable.map((target, row) => {
                const rowInputs = inputsForRow(tier, row);
                const yourOutput = liveOutputs[row];
                const isFailing = failingRows.includes(row);
                return (
                  <tr key={row} className={isFailing ? 'bg-[#FFEBEE]' : ''}>
                    {rowInputs.map((v, i) => (
                      <td key={i} className="border-[2px] border-dark px-3 py-1 text-center">
                        {v ? 1 : 0}
                      </td>
                    ))}
                    <td className="border-[2px] border-dark px-3 py-1 text-center">{target ? 1 : 0}</td>
                    <td className="border-[2px] border-dark px-3 py-1 text-center">
                      {yourOutput === null ? '–' : yourOutput ? 1 : 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {solved && (
          <WinOverlay
            title="Circuit Solved!"
            color={GATE_GRID_COLOR}
            onKeepGoing={() => newPuzzle(tierIndex)}
            onNewGame={() => newPuzzle(0)}
          />
        )}
      </div>
    </div>
  );
}
