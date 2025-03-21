import { useState, useRef } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
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
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
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
  
  // Добавление тега задачи в контекст
  const addTaskContext = (task: string) => {
    if (task) {
      const newValue = inputValue + ` <task>${task}</task>`;
      setInputValue(newValue);
      
      // Обновляем теги
      setContextTags([
        ...contextTags, 
        { id: `tag-${Date.now()}`, type: 'task', content: task }
      ]);
      
      setShowContextMenu(false);
      
      // Фокус на инпут
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };
  
  // Функция для запроса к AI
  const askAI = async () => {
    setIsLoading(true);
    
    try {
      // Подготовка запроса для IO Intelligence API
      const prompt = inputValue;
      
      // В реальном приложении здесь был бы запрос к IO Intelligence API
      // Пример запроса:
      // const response = await fetch('https://api.io.net/intelligence/chat', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer YOUR_API_KEY'
      //   },
      //   body: JSON.stringify({
      //     model: 'deepseek-ai/DeepSeek-R1',
      //     prompt: prompt,
      //     context: contextTags.map(tag => ({ type: tag.type, content: tag.content })),
      //     max_tokens: 500
      //   })
      // });
      // const data = await response.json();
      
      // Имитация ответа от AI для демонстрации
      setTimeout(() => {
        // Имитация ответа от AI
        const mockResponse = `Вот ответ на ваш вопрос "${prompt}".
        
Я учел контекст: ${contextTags.map(tag => `"${tag.content}"`).join(', ')}`;
        
        setResponse(mockResponse);
        setShowResponse(true);
        setIsLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка при обращении к AI:', error);
      setIsLoading(false);
    }
  };
  
  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      askAI();
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          <div style={{ 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: themeColors.secondaryBgColor,
            borderRadius: '18px',
            padding: '12px 16px',
            marginBottom: '10px',
            border: `1px solid ${themeColors.borderColor}`
          }}>
            {/* Отображение режима (listed/to do) */}
            <div style={{
              color: themeColors.linkColor,
              fontSize: '14px',
              marginBottom: '4px',
              fontWeight: 'medium'
            }}>
              {contextTags.length > 0 ? 'listed' : 'to do'}
            </div>
          
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '6px',
            }}>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder={contextTags.length > 0 ? "Помоги мне с этой задачей" : "Ask me about anything"}
                style={{ 
                  flexGrow: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: themeColors.textColor,
                  fontFamily: 'inherit',
                  fontSize: '16px',
                  padding: '0',
                  marginRight: '8px'
                }}
              />
              
              {contextTags.length > 0 && (
                <Button
                  style={{
                    backgroundColor: themeColors.linkColor,
                    color: '#FFFFFF',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    height: 'auto',
                    lineHeight: 1
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowContextMenu(!showContextMenu);
                  }}
                >
                  + add context
                </Button>
              )}
            </div>
            
            {/* Отображение контекстных тегов внутри поля */}
            {contextTags.length > 0 && (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '5px',
                marginTop: '8px' 
              }}>
                {contextTags.map(tag => (
                  <div 
                    key={tag.id}
                    style={{
                      backgroundColor: themeColors.buttonColor,
                      color: '#FFFFFF',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    {tag.content}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Выпадающее меню для контекста */}
          {showContextMenu && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              width: '100%',
              backgroundColor: themeColors.bgColor,
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              marginBottom: '8px',
              zIndex: 100
            }}>
              <div style={{
                padding: '12px',
                borderBottom: `1px solid ${themeColors.borderColor}`
              }}>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: themeColors.textColor
                }}>
                  Context
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{
                    backgroundColor: themeColors.secondaryBgColor,
                    color: themeColors.textColor,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>macOS</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" 
                        fill={themeColors.hintColor} />
                    </svg>
                  </div>
                  <div style={{
                    backgroundColor: themeColors.secondaryBgColor,
                    color: themeColors.textColor,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>Linux</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" 
                        fill={themeColors.hintColor} />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '8px 0' }}>
                <div style={{
                  padding: '10px 16px',
                  color: themeColors.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => addTaskContext('macOS')}>
                  <span>macOS</span>
                  <span style={{ marginLeft: 'auto', color: themeColors.linkColor }}>
                    ✓
                  </span>
                </div>
                <div style={{
                  padding: '10px 16px',
                  color: themeColors.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => addTaskContext('Linux')}>
                  <span>Linux</span>
                  <span style={{ marginLeft: 'auto', color: themeColors.linkColor }}>
                    ✓
                  </span>
                </div>
                <div style={{
                  padding: '10px 16px',
                  color: themeColors.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => addTaskContext('Windows 10')}>
                  <span>Windows 10</span>
                </div>
                <div style={{
                  padding: '10px 16px',
                  color: themeColors.textColor,
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => addTaskContext('Windows 11')}>
                  <span>Windows 11</span>
                </div>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            style={{ 
              display: 'none'
            }}
          />
        </div>
      </form>
      
      {/* Модальное окно с ответом */}
      {showResponse && (
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
            padding: '20px'
          }}
          onClick={() => setShowResponse(false)}
        >
          <div
            style={{
              backgroundColor: themeColors.bgColor,
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '70vh',
              overflow: 'auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              marginBottom: '15px',
              color: themeColors.textColor,
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              Ответ AI
            </h3>
            <p style={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              color: themeColors.textColor
            }}>
              {response}
            </p>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <Button 
                style={{
                  backgroundColor: themeColors.buttonColor,
                  color: themeColors.buttonTextColor,
                  padding: '10px 16px',
                  borderRadius: '8px'
                }}
                onClick={() => setShowResponse(false)}
              >
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 