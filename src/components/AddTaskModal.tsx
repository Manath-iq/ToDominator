import { useState } from 'react';
import { Button, Input } from '@telegram-apps/telegram-ui';
import { useThemeColors } from './theme';

interface AddTaskModalProps {
  onClose: () => void;
  onAddTask: (text: string) => void;
}

export const AddTaskModal = ({ onClose, onAddTask }: AddTaskModalProps) => {
  const themeColors = useThemeColors();
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
        fontFamily: "'SF Pro Display', sans-serif",
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
          fontWeight: 600,
          fontSize: '18px',
          fontFamily: "'SF Pro Display', sans-serif",
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
            boxSizing: 'border-box',
            fontFamily: "'SF Pro Display', sans-serif",
            fontSize: '16px',
            fontWeight: 400,
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
              fontWeight: 500,
              fontFamily: "'SF Pro Display', sans-serif",
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
              fontWeight: 500,
              fontFamily: "'SF Pro Display', sans-serif",
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