import { Link } from 'react-router-dom';
import {
  Crown,
  ChevronLeft,
  Link2,
  Share2,
  Swords,
  Trophy,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
}

function Step({ number, icon, title, description, tip }: StepProps) {
  return (
    <div className="flex gap-5" data-testid={`step-${number}`}>
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-violet-500/30">
          {number}
        </div>
        {number < 4 && <div className="w-px flex-1 bg-violet-500/30 mt-2" />}
      </div>
      <div className="pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-violet-300">{icon}</div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-white/70 mb-3">{description}</p>
        {tip && (
          <div className="flex items-start gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-violet-200">{tip}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GettingStarted() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 border-white/30 gap-2"
          >
            <Link to="/">
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="frosted-glass p-8 md:p-12 mb-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/20 rounded-full mb-6">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold pb-4 bg-linear-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent"
              data-testid="getting-started-title"
            >
              Getting Started
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Play your first game in under a minute. No account needed — just create, share, and
              play.
            </p>
          </div>

          {/* Steps */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-8 text-white/90">How to play in 4 easy steps</h2>
            <Step
              number={1}
              icon={<MousePointerClick className="w-5 h-5" />}
              title="Create a Game"
              description='Click the "Start Playing Now" button on the home page. The server instantly creates a new game and generates two secure, unique links — one for each player.'
              tip='The game is created immediately with no sign-up required. Both links are valid right away.'
            />
            <Step
              number={2}
              icon={<Share2 className="w-5 h-5" />}
              title="Share the Links"
              description="You'll see a White Player link and a Black Player link. Send the Black Player link to your opponent via any messaging app, email, or however you prefer."
              tip="Keep your own link private — it's your personal key to control your pieces."
            />
            <Step
              number={3}
              icon={<Link2 className="w-5 h-5" />}
              title="Open Your Link"
              description="Open the White Player link yourself. The game board will load and wait for your opponent to connect. You'll see their connection status in the sidebar."
              tip='Once both players open their links, the game starts automatically. White always moves first.'
            />
            <Step
              number={4}
              icon={<Swords className="w-5 h-5" />}
              title="Play Chess!"
              description="Drag and drop your pieces to make moves, or click a piece then click the destination square. Moves are validated in real time and your opponent sees them instantly."
              tip={undefined}
            />
          </div>

          {/* Game Controls */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-6 text-white/90">During the Game</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Crown className="w-5 h-5 text-yellow-400" />,
                  title: 'Your Turn',
                  description: "The sidebar shows whose turn it is. You can only move when it's your turn.",
                },
                {
                  icon: <Share2 className="w-5 h-5 text-blue-400" />,
                  title: 'Offer a Draw',
                  description:
                    'Use the "Offer Draw" button to propose a draw. Your opponent can accept or decline.',
                },
                {
                  icon: <Trophy className="w-5 h-5 text-red-400" />,
                  title: 'Resign',
                  description:
                    "If you're in a losing position, you can resign gracefully using the resign button.",
                },
                {
                  icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
                  title: 'Move History',
                  description:
                    'All moves are recorded in algebraic notation in the sidebar for review.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 p-4 bg-white/5 rounded-lg">
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div>
                    <div className="font-semibold text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-white/60">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rules Reminder */}
          <div className="bg-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-white/90">Chess Rules Supported</h2>
            <p className="text-white/70 text-sm mb-4">
              All standard chess rules are fully enforced — illegal moves are rejected automatically.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-white/70">
              {[
                'Standard piece movement',
                'En passant',
                'Castling (kingside & queenside)',
                'Pawn promotion',
                'Check & checkmate',
                'Stalemate',
                'Threefold repetition draw',
                '50-move rule draw',
              ].map((rule) => (
                <div key={rule} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Button
            asChild
            size="lg"
            className="bg-linear-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 text-white shadow-xl"
          >
            <Link to="/">
              <Crown className="w-5 h-5 mr-2" />
              Start Playing Now
            </Link>
          </Button>
          <div className="block">
            <Link
              to="/how-it-was-built"
              className="text-sm text-white/50 hover:text-white/80 transition-colors underline underline-offset-4"
            >
              Curious how it was built?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GettingStarted;
