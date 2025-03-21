import { useState, useEffect } from 'react';
import { initData } from '@telegram-apps/sdk-react';
import { TodoList } from './TodoList';
import { AIInputField } from './AIInputField';
import { useThemeColors } from './theme';

// Типы подписок
type SubscriptionType = 'pro trial' | 'premium' | 'none';

export const TodoApp = () => {
  const themeColors = useThemeColors();
  const [subscription] = useState<SubscriptionType>('pro trial');
  
  // Получаем данные пользователя из Telegram
  const user = initData.user();
  const username = user?.username || user?.firstName || 'Пользователь';
  const photoUrl = user?.photoUrl || '';

  // Загрузка параметров темы и подписки
  useEffect(() => {
    // В реальном приложении мы бы получали эти данные из Telegram API
    // Но для демонстрации используем заданные значения
    document.body.style.backgroundColor = themeColors.bgColor;
    document.body.style.color = themeColors.textColor;
  }, [themeColors.bgColor, themeColors.textColor]);
  
  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 0 20px',
        minHeight: '100vh',
        backgroundColor: themeColors.bgColor,
        color: themeColors.textColor,
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          marginBottom: '10px',
        }}
      >
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ color: '#3390EC' }}>0</span>
          <span style={{ color: themeColors.hintColor }}>/</span>
          <span style={{ color: themeColors.hintColor }}>0</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            marginRight: '8px' 
          }}>
            <span style={{ 
              color: themeColors.textColor,
              fontWeight: 'medium',
              fontSize: '14px',
              marginBottom: '2px'
            }}>
              {username}
            </span>
            <span
              style={{
                color: subscription === 'premium' 
                  ? themeColors.accentColor 
                  : themeColors.premiumColor,
                fontWeight: 'normal',
                fontSize: '12px'
              }}
            >
              {user?.isPremium ? 'premium' : subscription}
            </span>
          </div>
          
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: themeColors.buttonColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                target.parentElement!.style.fontSize = '18px';
              }}
            />
          </div>
        </div>
      </header>
      
      <main>
        <TodoList />
      </main>
      
      <footer style={{ padding: '0 16px', marginTop: '20px' }}>
        <AIInputField />
      </footer>
    </div>
  );
}; 