import { useState, useRef, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Обработка ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Убрана функциональность парсинга тегов задач
    setContextTags([]);
    
    // Автоматическое регулирование высоты
    adjustTextareaHeight();
  };
  
  // Регулирование высоты textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Сбрасываем высоту для корректного вычисления
    textarea.style.height = 'auto';
    
    // Сравниваем высоту содержимого с базовой высотой одной строки
    const baseHeight = 24; // Высота одной строки
    const scrollHeight = textarea.scrollHeight;
    
    if (scrollHeight > baseHeight) {
      // Только если контент не вмещается в одну строку, увеличиваем высоту
      textarea.style.height = `${scrollHeight}px`;
    } else {
      // Иначе фиксируем высоту в одну строку
      textarea.style.height = `${baseHeight}px`;
    }
  };
  
  // Вызываем регулировку высоты при изменении значения
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);
  
  // Функция для отправки запроса к AI через Cloudflare Worker
  const sendRequestToAI = async (userInput: string) => {
    setIsLoading(true);
    
    try {
      // Очищаем входной текст (теги больше не используются)
      const cleanInput = userInput.trim();
      
      // URL вашего Cloudflare Worker
      const workerUrl = 'https://todominator-ai-proxy.todominate-ai.workers.dev';
      
      console.log('Отправляем запрос к Worker:', {
        question: cleanInput,
        context: "" // Пустой контекст, т.к. функционал тегов задач отключен
      });
      
      // Отправляем запрос к Worker
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: cleanInput,
          context: "" // Пустой контекст, т.к. функционал тегов задач отключен
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ошибка Worker:', errorText);
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.answer) {
        throw new Error('Получен некорректный ответ от сервера');
      }
      
      setAiResponse(data.answer);
      setModalVisible(true);
    } catch (error) {
      console.error('Ошибка при запросе к AI:', error);
      setAiResponse('Произошла ошибка при обработке запроса. Пожалуйста, попробуйте снова позже.');
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обработка отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendRequestToAI(inputValue);
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
            </div>
            
            {/* Отображение контекстных тегов */}
            {renderContextTags()}
            
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Ask me about anything"
                disabled={isLoading}
                rows={1}
                style={{ 
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: themeColors.textColor,
                  fontFamily: "'SF Pro Display', sans-serif",
                  fontSize: '16px',
                  padding: '0',
                  resize: 'none', // Отключаем изменение размера пользователем
                  height: '24px', // Начальная высота в одну строку
                  minHeight: '24px',
                  lineHeight: '24px',
                  overflow: 'hidden', // Скрываем полосы прокрутки
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