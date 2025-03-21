import { useState, useEffect } from 'react';
import { Cell } from '@telegram-apps/telegram-ui';
import { useThemeColors } from './theme';

interface TodoProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
}

export const Todo = ({ id, text, completed, onToggle }: TodoProps) => {
  const themeColors = useThemeColors();
  const [isCompleted, setIsCompleted] = useState(completed);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isCompleted && !removing) {
      setRemoving(true);
      timer = setTimeout(() => {
        onToggle(id);
      }, 5000); // 5 секунд до удаления
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isCompleted, removing, id, onToggle]);

  const handleToggle = () => {
    if (removing) {
      setRemoving(false);
      setIsCompleted(false);
      return;
    }
    
    setIsCompleted(!isCompleted);
  };

  // Стили в соответствии со скриншотами
  const cellStyle = {
    backgroundColor: isCompleted 
      ? themeColors.buttonColor 
      : '#ffffff',
    marginBottom: 8,
    borderRadius: 10,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  };

  const checkboxStyle = {
    width: 20,
    height: 20,
    marginRight: 12,
    borderRadius: 4,
    border: isCompleted 
      ? 'none' 
      : `2px solid ${themeColors.hintColor}`,
    backgroundColor: isCompleted
      ? themeColors.buttonColor
      : 'transparent',
    position: 'relative' as const,
    appearance: 'none' as const,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  const textStyle = {
    color: isCompleted 
      ? themeColors.buttonTextColor 
      : '#000000',
    flexGrow: 1,
    fontSize: '16px',
  };

  return (
    <Cell style={cellStyle}>
      <div style={{ 
        padding: '12px 16px', 
        display: "flex", 
        alignItems: "center" 
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            style={checkboxStyle}
          />
          {isCompleted && (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                position: 'absolute',
                left: '3px',
                top: '3px',
                pointerEvents: 'none'
              }}
            >
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="white"
              />
            </svg>
          )}
        </div>
        <span style={textStyle}>
          {text}
        </span>
      </div>
    </Cell>
  );
}; 