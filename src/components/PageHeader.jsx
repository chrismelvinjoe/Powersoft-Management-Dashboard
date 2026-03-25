import React from 'react';
import './PageHeader.css';

const PageHeader = ({ title, actions }) => {
  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="page-actions">{actions}</div>
    </header>
  );
};

export default PageHeader;
