import BoardGateGrid from '@/games/boardGateGrid/BoardGateGrid';
import HowToPlayPanel from '@/components/HowToPlayPanel';

export default function GameGateGrid() {
  return (
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="font-pixel text-5xl font-bold"
            style={{ color: '#2ED8A7', textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}
          >
            Gate Grid
          </h1>
        </div>

        <BoardGateGrid />

        <div className="max-w-[560px] mx-auto mt-6">
          <HowToPlayPanel
            instructions="Match the target truth table by assigning a logic gate to every slot. Click a slot, then click a gate (AND/OR/XOR/NAND/NOR) to assign it — click the small bubble on a wire to invert that signal first. Higher tiers add more inputs, more slots, and unlock more gate types. Solve every row to win."
          />
        </div>
      </div>
    </div>
  );
}
