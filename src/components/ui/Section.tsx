import type { LucideIcon } from "lucide-react";
import type React from "react";

interface Props {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<Props> = ({
  icon: Icon,
  title,
  children,
}) => (
  <div className="space-y-3 bg-white/50 backdrop-blur-md p-3.5 rounded-md border border-white/50 shadow-xs">
    <div className="font-bold text-gray-900 flex items-center gap-2 text-xs">
      <Icon className="w-4 h-4 text-gray-700" />
      {title}
    </div>
    <div className="space-y-2.5">{children}</div>
  </div>
);
