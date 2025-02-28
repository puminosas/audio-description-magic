
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="flex flex-col items-center p-6 glassmorphism rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px]">
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-center text-muted-foreground">{description}</p>
    </div>
  );
};

export default FeatureCard;
