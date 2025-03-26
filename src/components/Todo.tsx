import { useState, useEffect, useRef } from 'react';
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
    padding: '0 0 0 0',
  };

  return (
    <div 
      className={`todo-item ${isCompleted ? 'completed' : ''}`}
      style={{
        backgroundColor: '#ffffff',
        marginBottom: '12px',
        borderRadius: '12px',
        width: 'calc(100% - 32px)',
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ 
        padding: '16px 16px', 
        display: "flex", 
        alignItems: "center",
        fontFamily: "'SF Pro Display', sans-serif",
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '48px',
        overflow: 'hidden',
      }}>
        <div style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0,
          marginRight: '16px'
        }}>
          <div
            onClick={handleToggle}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              border: isCompleted ? 'none' : '2px solid #d1d1d6',
              backgroundColor: isCompleted ? themeColors.buttonColor : 'transparent',
              position: 'relative',
              appearance: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
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
        {isCompleted && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: themeColors.buttonColor,
          }}></div>
        )}
      </div>
    </div>
  );
}; 