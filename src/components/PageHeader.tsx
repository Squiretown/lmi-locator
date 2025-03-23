
import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actionLink?: {
    text: string;
    href: string;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actionLink }) => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        {description}
      </p>
      {actionLink && (
        <div className="mt-4">
          <a href={actionLink.href} className="text-blue-600 hover:text-blue-800 font-medium">
            {actionLink.text} →
          </a>
        </div>
      )}
    </header>
  );
};

export default PageHeader;
