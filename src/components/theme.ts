import { themeParams, useSignal } from '@telegram-apps/sdk-react';

// Функция для получения текущих параметров цвета из Telegram
export const useThemeColors = () => {
  const tp = useSignal(themeParams.state);
  
  return {
    bgColor: tp.bgColor || '#17212b',
    textColor: tp.textColor || '#f5f5f5',
    buttonColor: tp.buttonColor || '#3390EC',
    buttonTextColor: tp.buttonTextColor || '#ffffff',
    accentColor: tp.accentTextColor || '#6ab2f2',
    secondaryBgColor: tp.secondaryBgColor || '#232e3c',
    hintColor: tp.hintColor || '#708499',
    premiumColor: '#f5a623', // Нет соответствующего параметра в Telegram API
    headerBgColor: tp.headerBgColor || '#17212b',
    linkColor: tp.linkColor || '#6ab3f3',
    cardBgColor: '#1c2733', // Нет соответствующего параметра в Telegram API
    inputBgColor: '#ffffff', // Нет соответствующего параметра в Telegram API
    inputTextColor: '#000000', // Нет соответствующего параметра в Telegram API
    borderColor: 'rgba(112, 132, 153, 0.2)' // Нет соответствующего параметра в Telegram API
  };
}; 