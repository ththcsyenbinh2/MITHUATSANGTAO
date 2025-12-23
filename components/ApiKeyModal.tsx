import React from 'react';

interface Props {
  onSave: (key: string) => void;
  isOpen: boolean;
}

/**
 * ApiKeyModal is kept for component structure but returns null 
 * as the application must not ask the user for an API key.
 */
const ApiKeyModal: React.FC<Props> = () => {
  return null;
};

export default ApiKeyModal;
