import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  Palette,
  Settings2,
  Monitor,
  Shield,
  Gamepad2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function SettingsCard({ icon, title, children }: SettingsCardProps) {
  return (
    <Card className="frosted-glass border-white/20 bg-white/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white/90">
          <span className="text-violet-300">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Settings() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
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
              <Settings2 className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold pb-4 bg-linear-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent">
              Game Settings
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Configure your chess game preferences. These options will be available when creating a
              new game.
            </p>
          </div>
        </div>

        {/* Settings grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Time Control */}
          <SettingsCard icon={<Clock className="w-5 h-5" />} title="Time Control">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {['Blitz (5+0)', 'Rapid (10+0)', 'Classical (30+0)'].map((label) => (
                  <div
                    key={label}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/60">Custom</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Minutes"
                    disabled
                    className="bg-white/10 border-white/20 text-white/70"
                  />
                  <Input
                    placeholder="Increment (sec)"
                    disabled
                    className="bg-white/10 border-white/20 text-white/70"
                  />
                </div>
              </div>
            </div>
          </SettingsCard>

          {/* Game Variant */}
          <SettingsCard icon={<Gamepad2 className="w-5 h-5" />} title="Game Variant">
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-2 rounded-lg bg-violet-500/20 border border-violet-500/30 text-sm text-violet-200">
                Standard
              </div>
              <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70">
                Chess960
              </div>
            </div>
          </SettingsCard>

          {/* Color */}
          <SettingsCard icon={<Palette className="w-5 h-5" />} title="Color">
            <div className="flex flex-wrap gap-2">
              {['Random', 'White', 'Black'].map((label) => (
                <div
                  key={label}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70"
                >
                  {label}
                </div>
              ))}
            </div>
          </SettingsCard>

          {/* Game Rules */}
          <SettingsCard icon={<Settings2 className="w-5 h-5" />} title="Game Rules">
            <div className="space-y-3">
              {[
                { label: 'Allow takebacks', desc: 'Let opponent undo last move' },
                { label: 'Allow draw offers', desc: 'Players can offer a draw' },
                { label: 'Allow undo', desc: 'Undo your own move before opponent plays' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/80">{label}</div>
                    <div className="text-xs text-white/50">{desc}</div>
                  </div>
                  <div
                    className="h-6 w-11 rounded-full bg-white/20 border border-white/30 shrink-0"
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          </SettingsCard>

          {/* Display */}
          <SettingsCard icon={<Monitor className="w-5 h-5" />} title="Display">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/60 block mb-2">Board theme</label>
                <div className="flex gap-2">
                  <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70">
                    Light
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white/70">
                    Dark
                  </div>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <label className="text-sm text-white/60 block mb-2">Piece set</label>
                <Input
                  placeholder="Default"
                  disabled
                  className="bg-white/10 border-white/20 text-white/70"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Sound effects</span>
                <div
                  className="h-6 w-11 rounded-full bg-white/20 border border-white/30"
                  aria-hidden
                />
              </div>
            </div>
          </SettingsCard>

          {/* Other */}
          <SettingsCard icon={<Shield className="w-5 h-5" />} title="Other">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Rated game</div>
                  <div className="text-xs text-white/50">Affects rating (when implemented)</div>
                </div>
                <div
                  className="h-6 w-11 rounded-full bg-white/20 border border-white/30 shrink-0"
                  aria-hidden
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/80">Private game</div>
                  <div className="text-xs text-white/50">Only invited players can join</div>
                </div>
                <div
                  className="h-6 w-11 rounded-full bg-white/20 border border-white/30 shrink-0"
                  aria-hidden
                />
              </div>
            </div>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}

export default Settings;
