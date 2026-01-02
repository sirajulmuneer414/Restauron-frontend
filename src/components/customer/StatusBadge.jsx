import React from 'react';
import { Clock, ChefHat, CheckCircle, Package } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const configs = {
    PENDING: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: Clock,
      label: 'Pending',
    },
    PREPARING: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
      icon: ChefHat,
      label: 'Preparing',
    },
    READY: {
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: Package,
      label: 'Ready',
    },
    COMPLETED: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-400',
      border: 'border-gray-500/30',
      icon: CheckCircle,
      label: 'Completed',
    },
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
