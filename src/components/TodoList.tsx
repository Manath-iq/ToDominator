import { useState, useEffect } from 'react';
import { List, Button } from '@telegram-apps/telegram-ui';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from './Todo';
import { AddTaskModal } from './AddTaskModal';

// Объект с цветами темы Telegram
const themeColors = {
  bgColor: '#17212b',
  textColor: '#f5f5f5',
  buttonColor: '#3390EC',
  buttonTextColor: '#ffffff',
  accentColor: '#6ab2f2',
  secondaryBgColor: '#232e3c',
  hintColor: '#708499',
  borderColor: 'rgba(112, 132, 153, 0.2)'
};

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка данных при монтировании
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos);
        setCompletedCount(parsedTodos.filter((todo: TodoItem) => todo.completed).length);
      } else {
        // Демо данные для тестирования
        const demoTodos = [
          { id: uuidv4(), text: 'Пойти в зал', completed: false },
          { id: uuidv4(), text: 'Пойти в зал', completed: false },
          { id: uuidv4(), text: 'Пойти в зал', completed: true },
          { id: uuidv4(), text: 'Пойти в зал', completed: true },
          { id: uuidv4(), text: 'Пойти в зал', completed: true },
          { id: uuidv4(), text: 'Пойти в зал', completed: true },
        ];
        setTodos(demoTodos);
        setCompletedCount(demoTodos.filter(todo => todo.completed).length);
        localStorage.setItem('todos', JSON.stringify(demoTodos));
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  }, []);

  // Сохранение в localStorage для демонстрации
  const saveTodos = (updatedTodos: TodoItem[]) => {
    try {
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setCompletedCount(updatedTodos.filter(todo => todo.completed).length);
    } catch (error) {
      console.error('Ошибка при сохранении задач:', error);
    }
  };
  
  const handleToggle = (id: string) => {
    const updatedTodos = todos.filter(todo => {
      if (todo.id === id) {
        // Если задача уже завершена и отмечена, удаляем ее
        if (todo.completed) {
          return false;
        }
        // Если не завершена, отмечаем как завершенную
        todo.completed = true;
      }
      return todo;
    });
    
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };
  
  const handleAddTask = (text: string) => {
    if (text.trim()) {
      const newTodo: TodoItem = {
        id: uuidv4(),
        text: text.trim(),
        completed: false
      };
      
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
      setIsModalOpen(false);
    }
  };
  
  return (
    <div style={{ padding: '0 16px' }}>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center',
          margin: '10px 0 20px',
          fontSize: '28px',
          fontWeight: 'bold',
          color: themeColors.textColor
        }}
      >
        <span style={{ 
          color: themeColors.buttonColor,
          marginRight: '4px'
        }}>
          {completedCount}
        </span>
        <span style={{ 
          color: themeColors.hintColor,
          marginRight: '4px',
          fontWeight: 'normal'
        }}>
          /
        </span>
        <span style={{ 
          color: themeColors.hintColor,
          fontWeight: 'normal'
        }}>
          {todos.length}
        </span>
      </div>
      
      <List>
        {todos.map(todo => (
          <Todo
            key={todo.id}
            id={todo.id}
            text={todo.text}
            completed={todo.completed}
            onToggle={handleToggle}
          />
        ))}
      </List>
      
      <Button 
        size="l" 
        style={{ 
          marginTop: 20, 
          width: '100%', 
          backgroundColor: themeColors.buttonColor, 
          color: themeColors.buttonTextColor,
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="white"/>
        </svg>
        New Task
      </Button>
      
      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
}; 