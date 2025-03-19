import { useLaunchParams, miniApp, useSignal } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { useState, useEffect } from 'react';
import { TodoList } from './TodoList';
import { AIInputField } from './AIInputField';

// Объект с цветами темы Telegram
const themeColors = {
  bgColor: '#17212b',
  textColor: '#f5f5f5',
  buttonColor: '#3390EC',
  buttonTextColor: '#ffffff',
  accentColor: '#6ab2f2',
  secondaryBgColor: '#232e3c',
  hintColor: '#708499',
  premiumColor: '#f5a623'
};

// Типы подписок
type SubscriptionType = 'pro trial' | 'premium' | 'none';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);
  const [subscription] = useState<SubscriptionType>('pro trial');
  const [username] = useState('ulikashi');

  useEffect(() => {
    document.body.style.backgroundColor = themeColors.bgColor;
    document.body.style.color = themeColors.textColor;
  }, []);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
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
            <span style={{ color: themeColors.buttonColor }}>0</span>
            <span style={{ color: themeColors.hintColor }}>/</span>
            <span style={{ color: themeColors.hintColor }}>0</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span
              style={{
                color: subscription === 'premium' 
                  ? themeColors.accentColor 
                  : themeColors.premiumColor,
                fontWeight: 'normal',
                fontSize: '16px',
                marginRight: '8px'
              }}
            >
              {subscription}
            </span>
            
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
                src="https://t.me/i/userpic/320/ulikashi.jpg" 
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
    </AppRoot>
  );
}
