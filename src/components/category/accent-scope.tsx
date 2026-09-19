import { accentStyle, type Accent, type Tone } from "@/components/category/accent";

export function AccentScope({
  accent,
  tone,
  children,
  className,
}: {
  accent: Accent;
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div style={accentStyle(accent, tone)} className={className}>
      {children}
    </div>
  );
}
