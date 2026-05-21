import { useParams } from 'react-router-dom';
import TapLearnGame from './TapLearnGame';
import { TAP_LEARN_DATA, type GameType } from '../data/tapLearnData';

interface TapLearnRouteProps {
  gameType?: GameType;
}

export default function TapLearnRoute({ gameType: propGameType }: TapLearnRouteProps) {
  const { gameType: paramGameType } = useParams<{ gameType: GameType }>();
  const gameType = propGameType || paramGameType;

  if (!gameType || !TAP_LEARN_DATA[gameType]) {
    return <div>Game not found</div>;
  }

  return <TapLearnGame gameType={gameType} data={TAP_LEARN_DATA[gameType]} />;
}
