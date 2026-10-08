import {
  Tv, Diamond, BookOpen, GraduationCap, Package, Brain,
  Shield, Zap, UserCheck, type LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Tv, Diamond, BookOpen, GraduationCap, Package, Brain, Shield, Zap, UserCheck,
};

interface CategoryIconProps {
  icon: string;
  className?: string;
}

export function CategoryIcon({ icon, className = 'w-6 h-6' }: CategoryIconProps) {
  const Icon = iconMap[icon] || Package;
  return <Icon className={className} />;
}
