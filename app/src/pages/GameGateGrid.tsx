import BoardGateGrid from '@/games/boardGateGrid/BoardGateGrid';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';

export default function GameGateGrid() {
  return (
    <GamePageLayout width="760px">
      <GameHeader title="Gate Grid" kicker="Logic circuits" />

      <BoardGateGrid />

      <div className="max-w-[560px] mx-auto">
          <HowToPlayPanel
            instructions="Match the target truth table by assigning a logic gate to every slot. Click a slot, then click a gate (AND/OR/XOR/NAND/NOR) to assign it — click the small bubble on a wire to invert that signal first. Higher tiers add more inputs, more slots, and unlock more gate types. Solve every row to win."
          />
      </div>
    </GamePageLayout>
  );
}
