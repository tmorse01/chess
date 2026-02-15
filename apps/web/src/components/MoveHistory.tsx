import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api-client';

interface MoveRow {
  moveNumber: number;
  white: string | null;
  black: string | null;
}

interface MoveHistoryProps {
  gameId: string;
  lastMove?: { from: string; to: string; san: string } | null;
  className?: string;
}

export function MoveHistory({ gameId, lastMove, className }: MoveHistoryProps) {
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMoves();
  }, [gameId]);

  // Re-fetch when a new move is made
  useEffect(() => {
    if (lastMove) {
      fetchMoves();
    }
  }, [lastMove]);

  const fetchMoves = async () => {
    try {
      const data = await api.games.getMoves(gameId);
      setMoves(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching moves:', err);
      setError('Failed to load move history');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <div className="frosted-glass p-4 space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Move History</h3>
          <Separator />
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading moves...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="frosted-glass p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Move History</h3>
          <Separator className="mb-3" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="frosted-glass p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Move History</h3>
        <Separator />

        {moves.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No moves yet. Make the first move!
          </p>
        ) : (
          <div className="h-[300px] lg:h-[400px] overflow-y-auto">
            <div className="space-y-1 pr-2">
              {moves.map((move, index) => (
                <div
                  key={move.moveNumber}
                  className={`flex items-center gap-4 p-2 rounded text-sm ${
                    index === moves.length - 1
                      ? 'bg-violet-500/10 border border-violet-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <span className="w-8 text-right text-muted-foreground font-mono">
                    {move.moveNumber}.
                  </span>
                  <span className="w-16 font-mono font-medium">{move.white || '-'}</span>
                  <span className="w-16 font-mono font-medium text-muted-foreground">
                    {move.black || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
