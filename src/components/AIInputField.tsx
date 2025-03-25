import { useState, useRef } from 'react';
import { useThemeColors } from './theme';

interface ContextTag {
  id: string;
  type: string;
  content: string;
}

export const AIInputField = () => {
  const themeColors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [contextTags, setContextTags] = useState<ContextTag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Обработка ввода и извлечение тегов контекста
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Извлекаем контекстные теги при вводе
    const taskTagsRegex = /<task>(.*?)<\/task>/g;
    const matches = [...value.matchAll(taskTagsRegex)];
    
    const newTags: ContextTag[] = matches.map((match, index) => ({
      id: `tag-${index}`,
      type: 'task',
      content: match[1]
    }));
    
    setContextTags(newTags);
  };
  
  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // В реальном приложении здесь был бы запрос к AI
      console.log('Запрос к AI:', inputValue);
      console.log('Контекст:', contextTags);
      setInputValue('');
      setContextTags([]);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ 
        position: 'relative',
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: themeColors.secondaryBgColor,
        borderRadius: '12px',
        padding: '10px 12px',
        border: `1px solid ${themeColors.borderColor}`,
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}>
          {/* Отображение режима (to do) */}
          <div style={{
            color: themeColors.linkColor,
            fontSize: '14px',
            marginBottom: '2px',
            fontWeight: 500,
            fontFamily: "'SF Pro Display', sans-serif",
          }}>
            to do
          </div>
        
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Ask me about anything"
            style={{ 
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: themeColors.hintColor,
              fontFamily: "'SF Pro Display', sans-serif",
              fontSize: '16px',
              padding: '0',
            }}
          />
        </div>
      </div>
    </form>
  );
}; 