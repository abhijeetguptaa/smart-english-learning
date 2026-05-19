import TapLearnGame from './TapLearnGame';
import { TAP_LEARN_DATA, type GameType } from '../data/tapLearnData';

interface TapLearnRouteProps {
  gameType: GameType;
}

export default function TapLearnRoute({ gameType }: TapLearnRouteProps) {
  return <TapLearnGame gameType={gameType} data={TAP_LEARN_DATA[gameType]} />;
}
