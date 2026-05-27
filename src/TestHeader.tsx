import React from 'react';

// Simple test component
const TestHeader: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
    </div>
  );
};

export default TestHeader;