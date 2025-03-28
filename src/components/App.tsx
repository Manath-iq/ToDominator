import { useLaunchParams, miniApp, useSignal, initData } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useState, useEffect } from 'react';
import { TodoList } from './TodoList';
import { AIInputField } from './AIInputField';
import { useThemeColors } from './theme';

// Типы подписок
type SubscriptionType = 'pro trial' | 'premium' | 'none';

export function App() {
  const themeColors = useThemeColors();
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const [subscription] = useState<SubscriptionType>('pro trial');
  
  // Получаем данные пользователя из Telegram
  const user = initData.user();
  const username = user?.username || user?.firstName || 'Пользователь';
  const photoUrl = user?.photoUrl || '';
  
  // Состояния для счетчика задач
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Получаем ID пользователя для хранения задач
  const userId = user?.id?.toString() || 'anonymous';
  const storageKey = `todos_${userId}`;
  const statsKey = `todo_stats_${userId}`;

  useEffect(() => {
    document.body.style.backgroundColor = themeColors.secondaryBgColor;
    document.body.style.color = themeColors.textColor;
    
    // Загружаем данные о задачах для отображения счетчиков
    try {
      // Загружаем статистику
      const statsJson = localStorage.getItem(statsKey);
      if (statsJson) {
        const stats = JSON.parse(statsJson);
        setCompletedCount(stats.completed);
        setTotalCount(stats.total);
      } else {
        // Если статистики нет, проверяем задачи
        const savedTodos = localStorage.getItem(storageKey);
        if (savedTodos) {
          const parsedTodos = JSON.parse(savedTodos);
          setTotalCount(parsedTodos.length);
          setCompletedCount(parsedTodos.filter((todo: {completed: boolean}) => todo.completed).length);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
    
    // Слушатель для обновления счетчиков при изменении localStorage
    const handleStorageChange = () => {
      try {
        // Сначала проверяем статистику
        const statsJson = localStorage.getItem(statsKey);
        if (statsJson) {
          const stats = JSON.parse(statsJson);
          setCompletedCount(stats.completed);
          setTotalCount(stats.total);
        } else {
          // Если статистики нет, используем данные задач
          const savedTodos = localStorage.getItem(storageKey);
          if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos);
            setTotalCount(parsedTodos.length);
            setCompletedCount(parsedTodos.filter((todo: {completed: boolean}) => todo.completed).length);
          } else {
            setTotalCount(0);
            setCompletedCount(0);
          }
        }
      } catch (error) {
        console.error('Ошибка при обновлении счетчиков задач:', error);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Создаем собственное событие для обработки изменений в текущей вкладке
    window.addEventListener('todosUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('todosUpdated', handleStorageChange);
    };
  }, [themeColors.secondaryBgColor, themeColors.textColor, storageKey]);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          minHeight: '100vh',
          backgroundColor: themeColors.secondaryBgColor,
          color: themeColors.textColor,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px 10px',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: themeColors.secondaryBgColor,
            borderBottom: `1px solid ${themeColors.borderColor || 'rgba(112, 132, 153, 0.1)'}`,
          }}
        >
          {/* Счетчик задач слева, как на референсе */}
          <div style={{ 
            fontSize: '48px', 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: themeColors.buttonColor, marginRight: '2px' }}>{completedCount}</span>
            <span style={{ 
              position: 'relative',
              display: 'inline-block',
              margin: '0 2px',
              color: '#708499'
            }}>/</span>
            <span style={{ color: themeColors.hintColor }}>{totalCount}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-end',
              marginRight: '12px' 
            }}>
              <span style={{ 
                color: themeColors.textColor,
                fontWeight: '600',
                fontSize: '18px',
                marginBottom: '4px'
              }}>
                {username}
              </span>
              <span
                style={{
                  color: subscription === 'premium' 
                    ? '#FF9500' 
                    : themeColors.premiumColor,
                  fontWeight: '500',
                  fontSize: '16px'
                }}
              >
                {user?.isPremium ? 'premium' : subscription}
              </span>
            </div>
            
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: themeColors.buttonColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${themeColors.buttonColor}`
              }}
            >
              <img 
                src={photoUrl || undefined} 
                alt="User avatar" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  // Если изображение не загрузилось, показываем первую букву имени
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerText = username.substring(0, 1).toUpperCase();
                  target.parentElement!.style.color = 'white';
                  target.parentElement!.style.fontSize = '22px';
                  target.parentElement!.style.fontWeight = 'bold';
                }}
              />
            </div>
          </div>
        </header>
        
        <div style={{
          padding: '10px 16px 0',
          position: 'sticky',
          top: '73px',
          zIndex: 10,
          backgroundColor: themeColors.secondaryBgColor,
        }}>
          <button
            style={{
              width: '100%',
              backgroundColor: themeColors.buttonColor,
              color: themeColors.buttonTextColor,
              border: 'none',
              borderRadius: '12px',
              padding: '14px 0',
              fontSize: '18px',
              fontWeight: '500',
              fontFamily: "'SF Pro Display', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px'
            }}
            data-add-task="true"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M10.0719 2.28218C5.49477 2.28218 1.97139 5.55555 1.97139 9.37595C1.97139 11.0847 2.66237 12.6644 3.83887 13.9045C4.13534 14.2169 4.35605 14.6677 4.32851 15.188C4.2904 15.9076 4.14671 16.9818 3.77395 17.9801C5.01847 17.6327 6.18394 17.0158 6.88911 16.5568C7.29301 16.2939 7.78582 16.1967 8.26274 16.292C8.84354 16.4082 9.44896 16.4697 10.0719 16.4697C14.649 16.4697 18.1724 13.1964 18.1724 9.37595C18.1724 5.55555 14.649 2.28218 10.0719 2.28218ZM0.171387 9.37595C0.171387 4.36667 4.70731 0.482178 10.0719 0.482178C15.4364 0.482178 19.9724 4.36667 19.9724 9.37595C19.9724 14.3852 15.4364 18.2697 10.0719 18.2697C9.33025 18.2697 8.6066 18.1964 7.90976 18.0571C7.89858 18.0548 7.88431 18.0567 7.87102 18.0654C6.89799 18.6987 5.11343 19.6326 3.23649 19.9419C2.5678 20.0521 2.08129 19.6456 1.86728 19.2423C1.6613 18.8541 1.61345 18.3285 1.86015 17.8628C2.2924 17.0468 2.48202 15.9238 2.52846 15.1385C1.06869 13.5976 0.171387 11.587 0.171387 9.37595ZM5.3822 7.98022C5.3822 7.48316 5.78514 7.08022 6.2822 7.08022H14.3353C14.8323 7.08022 15.2353 7.48316 15.2353 7.98022C15.2353 8.47727 14.8323 8.88022 14.3353 8.88022H6.2822C5.78514 8.88022 5.3822 8.47727 5.3822 7.98022ZM5.3822 11.533C5.3822 11.0359 5.78514 10.633 6.2822 10.633H12.4404C12.9375 10.633 13.3404 11.0359 13.3404 11.533C13.3404 12.0301 12.9375 12.433 12.4404 12.433H6.2822C5.78514 12.433 5.3822 12.0301 5.3822 11.533Z" fill="white"/>
            </svg>
            New Task
          </button>
        </div>
        
        <main style={{ 
          flex: '1',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingBottom: '80px',
          paddingTop: '0px'
        }}>
          <TodoList onCountsChange={(completed, total) => {
            setCompletedCount(completed);
            setTotalCount(total);
          }} />
        </main>
        
        <footer style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '10px 16px 20px', 
          backgroundColor: themeColors.secondaryBgColor,
          borderTop: `1px solid ${themeColors.borderColor || 'rgba(112, 132, 153, 0.1)'}`,
          zIndex: 100,
          maxWidth: '600px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <AIInputField />
        </footer>
      </div>
    </AppRoot>
  );
}
