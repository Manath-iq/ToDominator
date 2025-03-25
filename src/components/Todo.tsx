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

  // Новые стили в соответствии со вторым скриншотом
  const cellStyle = {
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 18,
    border: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
    position: 'relative' as const,
    overflow: 'hidden',
    height: 'auto'
  };

  const checkboxStyle = {
    width: 22,
    height: 22,
    borderRadius: '4px',
    border: isCompleted ? 'none' : '2px solid #d1d1d6',
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
    flexShrink: 0,
    boxSizing: 'border-box' as const
  };

  const textStyle = {
    color: '#000000',
    flexGrow: 1,
    fontSize: '16px',
    fontFamily: "'SF Pro Display', sans-serif",
    fontWeight: 400,
    transition: 'all 0.2s ease',
  };

  const inputStyle = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '16px',
    fontFamily: "'SF Pro Display', sans-serif",
    color: '#000000',
    padding: '0',
  };

  // Боковая полоска статуса задачи
  const stripeStyle = {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: '5px',
    backgroundColor: isCompleted ? themeColors.buttonColor : 'transparent',
  };

  return (
    <Cell style={cellStyle} className={`todo-cell ${isCompleted ? 'completed' : ''}`}>
      <div style={{ 
        padding: '12px 12px', 
        display: "flex", 
        alignItems: "center",
        fontFamily: "'SF Pro Display', sans-serif",
        boxSizing: 'border-box' as const,
        width: '100%',
        minHeight: '48px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0,
          marginRight: '12px'
        }}>
          <div
            onClick={handleToggle}
            style={{
              ...checkboxStyle,
              width: '24px',
              height: '24px'
            }}
            className="todo-checkbox"
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
                pointerEvents: 'none',
                left: '4px',
                top: '4px'
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
            style={{
              ...inputStyle,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            autoFocus
          />
        ) : (
          <span style={{
            ...textStyle,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: isCompleted ? 'line-through' : 'none',
            opacity: isCompleted ? 0.7 : 1
          }}>
            {text}
          </span>
        )}
        
        {/* Боковая полоска статуса */}
        <div style={stripeStyle}></div>
      </div>
    </Cell>
  );
}; 