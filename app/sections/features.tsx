import { FeatureType } from '@/types/feature-type';
import { FeatureSection } from '@/components/feature-section';
import {
  ZapIcon,
  CpuIcon,
  FingerprintIcon,
  PencilIcon,
  Settings2Icon,
  SparklesIcon,
} from 'lucide-react';

const features: FeatureType[] = [
  {
    title: 'Faaast',
    icon: <ZapIcon />,
    description: 'It supports an entire helping developers and innovate.',
  },
  {
    title: 'Powerful',
    icon: <CpuIcon />,
    description: 'It supports an entire helping developers and businesses.',
  },
  {
    title: 'Security',
    icon: <FingerprintIcon />,
    description: 'It supports an helping developers businesses.',
  },
  {
    title: 'Customization',
    icon: <PencilIcon />,
    description: 'It supports helping developers and businesses innovate.',
  },
  {
    title: 'Control',
    icon: <Settings2Icon />,
    description: 'It supports helping developers and businesses innovate.',
  },
  {
    title: 'Built for AI',
    icon: <SparklesIcon />,
    description: 'It supports helping developers and businesses innovate.',
  },
];

export function Features() {
  return (
    <div id="features" className="my-10">
      <FeatureSection features={features} />
    </div>
  );
}
