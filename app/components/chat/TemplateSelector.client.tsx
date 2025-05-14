import { useState } from 'react';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';

const RESUME_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate style for traditional industries',
    thumbnail: '/templates/professional.jpg',
    previewClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20',
    iconClass: 'i-ph:buildings-fill',
    iconColor: 'text-blue-500 dark:text-blue-400'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design for creative fields',
    thumbnail: '/templates/modern.jpg',
    previewClass: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20',
    iconClass: 'i-ph:paint-brush-fill',
    iconColor: 'text-purple-500 dark:text-purple-400'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant for any profession',
    thumbnail: '/templates/minimal.jpg',
    previewClass: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/20',
    iconClass: 'i-ph:squares-four-fill',
    iconColor: 'text-gray-500 dark:text-gray-400'
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Formal layout for education and research',
    thumbnail: '/templates/academic.jpg',
    previewClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20',
    iconClass: 'i-ph:graduation-cap-fill',
    iconColor: 'text-green-500 dark:text-green-400'
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for leadership roles',
    thumbnail: '/templates/executive.jpg',
    previewClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20',
    iconClass: 'i-ph:briefcase-fill',
    iconColor: 'text-amber-500 dark:text-amber-400'
  },
  {
    id: 'tech',
    name: 'Tech',
    description: 'Modern layout for IT and tech professionals',
    thumbnail: '/templates/tech.jpg',
    previewClass: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20',
    iconClass: 'i-ph:code-fill',
    iconColor: 'text-cyan-500 dark:text-cyan-400'
  }
];

interface TemplateCardProps {
  template: typeof RESUME_TEMPLATES[0];
  isSelected: boolean;
  onClick: () => void;
}

const TemplateCard = ({ template, isSelected, onClick }: TemplateCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={classNames(
        'group flex flex-col items-center p-4 rounded-lg transition-all cursor-pointer animate-fade-in',
        'border-2',
        isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-50 dark:hover:bg-gray-800/30'
      )}
    >
      <div className={classNames(
        'w-full aspect-[3/4] rounded-md mb-3 flex items-center justify-center overflow-hidden',
        template.previewClass
      )}>
        <div className={classNames(template.iconClass, template.iconColor, 'text-4xl')}></div>
      </div>
      <h3 className="text-sm font-medium text-bolt-elements-textPrimary">{template.name}</h3>
      <p className="text-xs text-bolt-elements-textSecondary mt-1 text-center">{template.description}</p>
      <div className={classNames(
        'mt-3 px-3 py-1 text-xs rounded-full transition-all',
        isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-transparent text-bolt-elements-textSecondary group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400'
      )}>
        {isSelected ? 'Selected' : 'Select'}
      </div>
    </div>
  );
};

export interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
  selectedId: string | null;
  showConfirmation: boolean;
}

export const TemplateSelector = ({ onSelect, selectedId, showConfirmation }: TemplateSelectorProps) => {
  const handleSelectTemplate = (templateId: string) => {
    onSelect(templateId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-4 animate-fade-in animation-delay-700">
      <h2 className="text-xl font-semibold text-center text-bolt-elements-textPrimary mb-6">
        Choose a Template
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
        {RESUME_TEMPLATES.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedId === template.id}
            onClick={() => handleSelectTemplate(template.id)}
          />
        ))}
      </div>
    </div>
  );
}; 