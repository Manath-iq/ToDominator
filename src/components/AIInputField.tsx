import { useState, useRef } from 'react';
import { useThemeColors } from './theme';

interface ContextTag {
  id: string;
  type: string;
  content: string;
}

interface AIResponseModalProps {
  isVisible: boolean;
  response: string;
  onClose: () => void;
}

// Компонент модального окна для отображения ответа AI
const AIResponseModal = ({ isVisible, response, onClose }: AIResponseModalProps) => {
  const themeColors = useThemeColors();
  
  if (!isVisible) return null;
  
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
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}>
          <h3 style={{ 
            color: themeColors.textColor,
            fontWeight: 600,
            fontSize: '18px',
            fontFamily: "'SF Pro Display', sans-serif",
            margin: 0
          }}>
            Ответ ассистента
          </h3>
          
          <div 
            onClick={onClose}
            style={{
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke={themeColors.textColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        <div style={{
          color: themeColors.textColor,
          lineHeight: '1.5',
          fontSize: '16px',
          whiteSpace: 'pre-wrap',
          fontFamily: "'SF Pro Display', sans-serif",
          padding: '10px 0',
          borderTop: `1px solid ${themeColors.borderColor || 'rgba(112, 132, 153, 0.1)'}`,
          borderBottom: `1px solid ${themeColors.borderColor || 'rgba(112, 132, 153, 0.1)'}`,
        }}>
          {response}
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: themeColors.secondaryBgColor,
              color: themeColors.textColor,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: "'SF Pro Display', sans-serif",
            }}
          >
            Закрыть
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: themeColors.buttonColor,
              color: themeColors.buttonTextColor,
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: "'SF Pro Display', sans-serif",
            }}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export const AIInputField = () => {
  const themeColors = useThemeColors();
  const [inputValue, setInputValue] = useState('');
  const [contextTags, setContextTags] = useState<ContextTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
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
  
  // Функция для отправки запроса к IO Intelligence API
  const sendRequestToAI = async (userInput: string, context: ContextTag[]) => {
    setIsLoading(true);
    
    try {
      // Формируем контекст из задач для AI
      const taskContext = context
        .filter(tag => tag.type === 'task')
        .map(tag => tag.content)
        .join(", ");
      
      // Очищаем входной текст от тегов
      const cleanInput = userInput.replace(/<task>.*?<\/task>/g, '').trim();
      
      // Формируем системное сообщение
      const systemMessage = "Ты помощник по задачам, который дает краткие и полезные ответы на русском языке.";
      
      // Составляем сообщение с контекстом задач, если они есть
      const userMessage = taskContext 
        ? `Контекст моих задач: ${taskContext}. Мой вопрос: ${cleanInput}` 
        : cleanInput;
      
      // API ключ
      const API_TOKEN = 'io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6ImY1YjNkZGIzLWJiNjctNGEzOC04ZjAwLWY0ZTU1OWZiMGVjOCIsImV4cCI6NDg5NjgwNjUxM30.oAgtqeYt0HsyiquwNjyZFaTDiQz0DiLeoKwDRChw4Xtve5-83cwhYBkHtWQ9R3D8wLIppq5halL9Uz0ARe-TEw';
      
      console.log('Отправляем запрос к API...');
      
      const requestBody = {
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        reasoning_content: true,
        max_completion_tokens: 250
      };
      
      console.log('Запрос:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch('https://api.intelligence.io.solutions/api/v1/chat/completions', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Статус ответа:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка API:', errorText);
        throw new Error(`API вернул ошибку: ${response.status}. ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Ответ API:', data);
      
      // Проверяем структуру ответа согласно документации
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        setAiResponse(data.choices[0].message.content);
        setModalVisible(true);
      } else {
        throw new Error('Неожиданная структура ответа API');
      }
    } catch (error) {
      console.error('Ошибка при запросе к AI:', error);
      setAiResponse('Произошла ошибка при обработке запроса: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка') + '\n\nПожалуйста, попробуйте снова позже.');
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendRequestToAI(inputValue, contextTags);
    }
  };
  
  // Закрытие модального окна
  const handleCloseModal = () => {
    setModalVisible(false);
    // Очищаем после закрытия модального окна
    setInputValue('');
    setContextTags([]);
  };
  
  // Отображение контекстных тегов
  const renderContextTags = () => {
    if (contextTags.length === 0) return null;
    
    return (
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '5px',
        marginTop: '8px',
        marginBottom: '5px'
      }}>
        {contextTags.map(tag => (
          <div 
            key={tag.id}
            style={{
              backgroundColor: themeColors.buttonColor,
              color: themeColors.buttonTextColor,
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              fontFamily: "'SF Pro Display', sans-serif",
            }}
          >
            <span>{tag.content}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Добавление тега задачи в поле ввода
  const addTaskTag = () => {
    // Получаем текущую позицию курсора
    const cursorPosition = inputRef.current?.selectionStart || inputValue.length;
    
    // Вставляем тег задачи в позицию курсора
    const newValue = 
      inputValue.substring(0, cursorPosition) + 
      '<task>Название задачи</task>' + 
      inputValue.substring(cursorPosition);
    
    setInputValue(newValue);
    
    // Устанавливаем фокус на поле ввода после добавления тега
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        // Устанавливаем курсор внутри тега после слова "Название"
        const newPosition = cursorPosition + '<task>'.length;
        inputRef.current.setSelectionRange(newPosition, newPosition + 14);
      }
    }, 0);
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{ 
          position: 'relative',
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: themeColors.secondaryBgColor,
          borderRadius: '12px',
          padding: '10px 12px',
          border: `1px solid ${themeColors.borderColor || 'rgba(112, 132, 153, 0.1)'}`,
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
          }}>
            {/* Отображение режима (to do) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2px',
            }}>
              <div style={{
                color: themeColors.linkColor,
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: "'SF Pro Display', sans-serif",
              }}>
                to do
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {/* Кнопка добавления тега задачи */}
                <div 
                  onClick={addTaskTag}
                  style={{
                    fontSize: '12px',
                    color: themeColors.buttonColor,
                    cursor: 'pointer',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    backgroundColor: themeColors.secondaryBgColor,
                    border: `1px solid ${themeColors.buttonColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke={themeColors.buttonColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Добавить задачу</span>
                </div>
              </div>
            </div>
            
            {/* Отображение контекстных тегов */}
            {renderContextTags()}
            
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask me about anything"
                disabled={isLoading}
                style={{ 
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: themeColors.textColor,
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: '16px',
                  padding: '0',
                }}
              />
              
              {inputValue.trim() && (
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: themeColors.buttonColor,
                    cursor: isLoading ? 'default' : 'pointer',
                    padding: '5px',
                    marginLeft: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isLoading ? (
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: `2px solid ${themeColors.buttonColor}`,
                      borderTopColor: 'transparent',
                      animation: 'spin 1s linear infinite'
                    }} />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12L18 12" stroke={themeColors.buttonColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6L18 12L12 18" stroke={themeColors.buttonColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
      
      {/* Добавляем глобальный стиль для анимации спиннера */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Модальное окно с ответом AI */}
      <AIResponseModal
        isVisible={modalVisible}
        response={aiResponse}
        onClose={handleCloseModal}
      />
    </>
  );
}; 