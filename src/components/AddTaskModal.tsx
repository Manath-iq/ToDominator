import { useState } from 'react';
import { Button, Input } from '@telegram-apps/telegram-ui';

// Объект с цветами темы Telegram
const themeColors = {
  bgColor: '#17212b',
  textColor: '#f5f5f5',
  buttonColor: '#3390EC',
  buttonTextColor: '#ffffff',
  accentColor: '#6ab2f2',
  secondaryBgColor: '#232e3c',
  hintColor: '#708499',
  inputBgColor: '#ffffff',
  inputTextColor: '#000000',
  borderColor: 'rgba(112, 132, 153, 0.2)'
};

interface AddTaskModalProps {
  onClose: () => void;
  onAddTask: (text: string) => void;
}

export const AddTaskModal = ({ onClose, onAddTask }: AddTaskModalProps) => {
  const [taskText, setTaskText] = useState('');
  
  const handleSubmit = () => {
    if (taskText.trim()) {
      onAddTask(taskText);
      setTaskText('');
    }
  };
  
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          backgroundColor: themeColors.bgColor,
          borderRadius: '12px',
          padding: '20px',
          width: '80%',
          maxWidth: '400px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          marginBottom: '15px', 
          color: themeColors.textColor,
          fontWeight: 'bold',
          fontSize: '18px'
        }}>
          Новая задача
        </h3>
        
        <Input
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Введите текст задачи"
          style={{ 
            marginBottom: '20px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: themeColors.inputBgColor,
            color: themeColors.inputTextColor,
            border: 'none',
            width: '100%',
            boxSizing: 'border-box'
          }}
          autoFocus
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button 
            style={{ 
              backgroundColor: themeColors.secondaryBgColor, 
              color: themeColors.textColor,
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 'medium'
            }}
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button 
            style={{
              backgroundColor: themeColors.buttonColor,
              color: themeColors.buttonTextColor,
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 'medium'
            }}
            onClick={handleSubmit}
          >
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
}; 