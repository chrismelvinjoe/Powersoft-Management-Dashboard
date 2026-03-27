import React, { useState } from 'react';
import { getApiBaseUrl, setApiOverride } from '../utils/apiConfig';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { Globe, AlertCircle } from 'lucide-react';

const BackendSettingsModal = ({ isOpen, onClose }) => {
  const currentUrl = getApiBaseUrl();
  const [newUrl, setNewUrl] = useState(currentUrl);
  const isLocal = currentUrl.includes('localhost');

  const handleSave = () => {
    setApiOverride(newUrl);
    onClose();
  };

  const handleReset = () => {
    setApiOverride(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backend Connection Settings">
      <div className="backend-settings-content" style={{ padding: '1rem 0' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          padding: '1rem', 
          background: isLocal ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${isLocal ? '#ef4444' : '#10b981'}`,
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {isLocal ? <AlertCircle color="#ef4444" /> : <Globe color="#10b981" />}
          <div>
            <strong style={{ display: 'block', color: isLocal ? '#ef4444' : '#10b981' }}>
              {isLocal ? 'Using Local Backend' : 'Connected to Cloud'}
            </strong>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{currentUrl}</span>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          To fix "Data not showing" on other devices, paste your **Render Service URL** below:
        </p>

        <Input 
          label="Render Backend URL" 
          value={newUrl} 
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://your-app.onrender.com"
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <Button onClick={handleSave} style={{ flex: 1 }}>Apply & Reload</Button>
          <Button variant="secondary" onClick={handleReset}>Reset to Default</Button>
        </div>
        
        <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Note: This setting is saved in your browser and applies only to this device.
        </p>
      </div>
    </Modal>
  );
};

export default BackendSettingsModal;
