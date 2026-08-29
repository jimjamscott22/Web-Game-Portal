import BoardRoboRoute from '@/games/boardRoboRoute/BoardRoboRoute';
import GameHeader from '@/components/GameHeader';
import GamePageLayout from '@/components/GamePageLayout';
import HowToPlayPanel from '@/components/HowToPlayPanel';

export default function GameRoboRoute() {
  return (
    <GamePageLayout width="1180px">
      <GameHeader title="RoboRoute" kicker="Coding puzzle" />

      <BoardRoboRoute />

      <div className="max-w-[760px] mx-auto mt-6">
        <HowToPlayPanel
          instructions="Choose an Add here lane, then build your program from the available commands. Nested repeat, while, and if/else blocks each have their own lanes. Run plays the whole program, Step advances one instruction, Stop pauses it, and Reset clears it. Collect every battery before reaching the beacon. Shorter solved programs earn more stars."
        />
      </div>
    </GamePageLayout>
  );
}
