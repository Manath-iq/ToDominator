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

  useEffect(() => {
    document.body.style.backgroundColor = themeColors.bgColor;
    document.body.style.color = themeColors.textColor;
  }, [themeColors.bgColor, themeColors.textColor]);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '0 0 80px',
          minHeight: '100vh',
          backgroundColor: themeColors.bgColor,
          color: themeColors.textColor,
          position: 'relative',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '12px 16px',
            marginBottom: '10px',
          }}
        >
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
        
        <footer style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          padding: '10px 16px 20px', 
          backgroundColor: themeColors.bgColor,
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
