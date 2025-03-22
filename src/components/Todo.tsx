import { useState, useEffect, useRef } from 'react';
import { Cell } from '@telegram-apps/telegram-ui';
import { useThemeColors } from './theme';

interface TodoProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  isEditing?: boolean;
  onTextChange?: (id: string, text: string) => void;
  onBlur?: (id: string) => void;
}

export const Todo = ({ 
  id, 
  text, 
  completed, 
  onToggle, 
  isEditing = false, 
  onTextChange, 
  onBlur 
}: TodoProps) => {
  const themeColors = useThemeColors();
  const [isCompleted, setIsCompleted] = useState(completed);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsCompleted(completed);
  }, [completed]);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  useEffect(() => {
    // Автоматический фокус на поле ввода при редактировании
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    // Вызываем родительскую функцию для обработки состояния завершения
    onToggle(id);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
    if (onTextChange) {
      onTextChange(id, e.target.value);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (onBlur) {
        onBlur(id);
      }
    }
  };

  // Стили в соответствии со скриншотами
  const cellStyle = {
    backgroundColor: isCompleted 
      ? themeColors.buttonColor
      : '#ffffff',
    marginBottom: 6,
    borderRadius: 10,
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.05)',
    transform: isCompleted ? 'scale(0.98)' : 'scale(1)',
    transition: 'all 0.2s ease',
    width: '100%',
    maxWidth: '100%',
  };

  const checkboxStyle = {
    width: 18,
    height: 18,
    marginRight: 10,
    borderRadius: 4,
    border: isCompleted 
      ? 'none' 
      : `1.5px solid ${themeColors.hintColor}`,
    backgroundColor: isCompleted
      ? themeColors.buttonColor
      : 'transparent',
    position: 'relative' as const,
    appearance: 'none' as const,
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transition: 'all 0.2s ease',
  };

  const textStyle = {
    color: isCompleted 
      ? themeColors.buttonTextColor 
      : '#000000',
    flexGrow: 1,
    fontSize: '15px',
    fontFamily: "'SF Pro Display', sans-serif",
    fontWeight: isCompleted ? 500 : 400,
    transition: 'all 0.2s ease',
  };

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '15px',
    fontFamily: "'SF Pro Display', sans-serif",
    color: '#000000',
    padding: '0',
  };

  return (
    <Cell style={cellStyle}>
      <div style={{ 
        padding: '6px 12px', 
        display: "flex", 
        alignItems: "center",
        fontFamily: "'SF Pro Display', sans-serif",
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleToggle}
            style={checkboxStyle}
            disabled={isEditing}
          />
          {isCompleted && (
            <svg
              width="12"
              height="12"
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
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={handleTextChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Введите текст задачи"
            style={inputStyle}
            autoFocus
          />
        ) : (
          <span style={textStyle}>
            {text}
          </span>
        )}
      </div>
    </Cell>
  );
}; 