import { Link } from 'wouter';
import { BlindSpotGame } from '../components/BlindSpotGame';
import '../blind-spot.css';

export function GamePage() {
  return (
    <main className="blind-spot">
      <Link href="/" className="blind-spot__back">THE BLIND SPOT</Link>
      <BlindSpotGame />
    </main>
  );
}
