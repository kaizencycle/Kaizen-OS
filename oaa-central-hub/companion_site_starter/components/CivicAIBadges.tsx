import React from 'react';

interface BadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CivicAIVerifiedBadge: React.FC<BadgeProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 bg-green-100 text-green-800 border border-green-200 rounded-full font-medium ${sizeClasses[size]} ${className}`}
    >
      <span className="text-green-600">✅</span>
      <span>Civic AI Verified</span>
    </span>
  );
};

export const ProofOfIntegrityBadge: React.FC<BadgeProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 border border-blue-200 rounded-full font-medium ${sizeClasses[size]} ${className}`}
    >
      <span className="text-blue-600">🔒</span>
      <span>Proof of Integrity Enabled</span>
    </span>
  );
};

export const HumanMachineLoopBadge: React.FC<BadgeProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full font-medium ${sizeClasses[size]} ${className}`}
    >
      <span className="text-purple-600">💫</span>
      <span>Human + Machine in Loop</span>
    </span>
  );
};

export const CivicAIStackBadge: React.FC<BadgeProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200 rounded-full font-medium ${sizeClasses[size]} ${className}`}
    >
      <span className="text-indigo-600">🌍</span>
      <span>Civic AI Native Stack</span>
    </span>
  );
};

export const AllCivicAIBadges: React.FC<BadgeProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <CivicAIStackBadge size={size} />
      <CivicAIVerifiedBadge size={size} />
      <ProofOfIntegrityBadge size={size} />
      <HumanMachineLoopBadge size={size} />
    </div>
  );
};

// Markdown-compatible badge components for documentation
export const MarkdownBadges = {
  civicAI: '![Civic AI Verified](https://img.shields.io/badge/Civic_AI-Verified-green?style=for-the-badge&logo=check-circle)',
  proofOfIntegrity: '![Proof of Integrity](https://img.shields.io/badge/Proof_of_Integrity-Enabled-blue?style=for-the-badge&logo=shield-check)',
  humanMachineLoop: '![Human + Machine in Loop](https://img.shields.io/badge/Human_%2B_Machine-in_Loop-purple?style=for-the-badge&logo=users)',
  civicAIStack: '![Civic AI Native Stack](https://img.shields.io/badge/Civic_AI_Native-Stack-indigo?style=for-the-badge&logo=globe)'
};

// HTML badge components for direct embedding
export const HTMLBadges = {
  civicAI: '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 9999px; font-weight: 500; font-size: 14px;">✅ Civic AI Verified</span>',
  proofOfIntegrity: '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; border-radius: 9999px; font-weight: 500; font-size: 14px;">🔒 Proof of Integrity Enabled</span>',
  humanMachineLoop: '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #f3e8ff; color: #7c3aed; border: 1px solid #c4b5fd; border-radius: 9999px; font-weight: 500; font-size: 14px;">💫 Human + Machine in Loop</span>',
  civicAIStack: '<span style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: linear-gradient(90deg, #e0e7ff, #f3e8ff); color: #3730a3; border: 1px solid #a5b4fc; border-radius: 9999px; font-weight: 500; font-size: 14px;">🌍 Civic AI Native Stack</span>'
};