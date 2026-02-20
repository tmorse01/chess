import { Link } from 'react-router-dom';
import {
  Crown,
  Code2,
  Database,
  Globe,
  Layers,
  Zap,
  Shield,
  ChevronLeft,
  Server,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TechCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
}

function TechCard({ icon, title, description, tags }: TechCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-white/70 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-1 bg-violet-500/20 border border-violet-500/30 rounded-full text-violet-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWasBuilt() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-500/20 rounded-full mb-6">
              <Code2 className="w-8 h-8 text-violet-400" />
            </div>
            <h1
              className="text-4xl md:text-5xl font-bold pb-4 bg-linear-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent"
              data-testid="how-built-title"
            >
              How It Was Built
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              A deep dive into the technologies and architecture behind this real-time multiplayer
              chess application.
            </p>
          </div>

          {/* Architecture Overview */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Layers className="w-6 h-6 text-violet-400" />
              Architecture Overview
            </h2>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6">
              <p className="text-white/80 mb-4">
                This app is built as a{' '}
                <strong className="text-white">full-stack TypeScript monorepo</strong> using pnpm
                workspaces. It separates concerns cleanly across three packages: a React frontend,
                an Express backend, and a shared types library.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Monitor className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-sm font-semibold">Frontend</div>
                  <div className="text-xs text-white/60">React + Vite</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Server className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <div className="text-sm font-semibold">Backend</div>
                  <div className="text-xs text-white/60">Express + Socket.IO</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Database className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="text-sm font-semibold">Database</div>
                  <div className="text-xs text-white/60">PostgreSQL + Drizzle</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Cards */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-violet-400" />
              Tech Stack
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <TechCard
                icon={<Monitor className="w-8 h-8 text-blue-400" />}
                title="Frontend"
                description="Built with React 18 and Vite for fast development. TypeScript throughout for type safety. Tailwind CSS v4 for utility-first styling with a custom violet theme."
                tags={['React 18', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'shadcn/ui']}
              />
              <TechCard
                icon={<Server className="w-8 h-8 text-green-400" />}
                title="Backend API"
                description="Express.js REST API handles game creation and state management. Socket.IO enables real-time bidirectional communication for live move updates between players."
                tags={['Node.js', 'Express', 'Socket.IO', 'TypeScript']}
              />
              <TechCard
                icon={<Database className="w-8 h-8 text-yellow-400" />}
                title="Database"
                description="PostgreSQL stores game state persistently. Drizzle ORM provides type-safe database queries with schema-driven migrations."
                tags={['PostgreSQL', 'Drizzle ORM', 'SQL Migrations']}
              />
              <TechCard
                icon={<Shield className="w-8 h-8 text-red-400" />}
                title="Security"
                description="Token-based access control ensures only the rightful player can move their pieces. Each player receives a unique secure URL that authenticates their session."
                tags={['JWT Tokens', 'CORS', 'Input Validation']}
              />
            </div>
          </div>

          {/* Real-time Architecture */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-violet-400" />
              Real-Time Architecture
            </h2>
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Game Creation',
                  description:
                    'A POST request to /api/games creates a new game in the database and returns two unique URLs — one for each player.',
                },
                {
                  step: '2',
                  title: 'WebSocket Connection',
                  description:
                    'Players open their URL and immediately connect via Socket.IO. The server joins them to a game-specific room.',
                },
                {
                  step: '3',
                  title: 'Move Validation',
                  description:
                    'When a player makes a move, chess.js validates it server-side. Invalid moves are rejected before any state change.',
                },
                {
                  step: '4',
                  title: 'Live Sync',
                  description:
                    'Valid moves are persisted to the database and broadcast to both players via Socket.IO room events in real time.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{item.title}</div>
                    <div className="text-sm text-white/70">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chess Logic */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Chess Engine
            </h2>
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-white/80 mb-4">
                Game logic is powered by <strong className="text-white">chess.js</strong>, a battle-
                tested library that handles all standard chess rules including:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-white/70">
                {[
                  'Legal move generation',
                  'En passant captures',
                  'Castling (kingside & queenside)',
                  'Pawn promotion',
                  'Check & checkmate detection',
                  'Stalemate & draw detection',
                  'Threefold repetition',
                  '50-move rule',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-white/80 mt-4">
                The board is rendered using <strong className="text-white">react-chessboard</strong>
                , which provides drag-and-drop piece movement with full accessibility support.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-linear-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 text-white shadow-xl"
          >
            <Link to="/">Start Playing Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HowItWasBuilt;
