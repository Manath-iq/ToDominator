import { useState, useEffect } from 'react';
import { List, Button } from '@telegram-apps/telegram-ui';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from './Todo';
import { AddTaskModal } from './AddTaskModal';
import { useThemeColors } from './theme';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export const TodoList = () => {
  const themeColors = useThemeColors();
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
        // Для новых пользователей - пустой массив задач
        setTodos([]);
        setCompletedCount(0);
        localStorage.setItem('todos', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  }, []);

  // Сохранение в localStorage
  const saveTodos = (updatedTodos: TodoItem[]) => {
    try {
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      setCompletedCount(updatedTodos.filter(todo => todo.completed).length);
    } catch (error) {
      console.error('Ошибка при сохранении задач:', error);
    }
  };
  
  const handleToggle = (id: string) => {
    // Находим задачу по id
    const todoToUpdate = todos.find(todo => todo.id === id);
    
    if (todoToUpdate) {
      if (todoToUpdate.completed) {
        // Если задача уже завершена, удаляем ее
        const updatedTodos = todos.filter(todo => todo.id !== id);
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
      } else {
        // Если задача не завершена, отмечаем как завершенную и удаляем через 5 секунд
        const updatedTodos = todos.map(todo => 
          todo.id === id ? { ...todo, completed: true } : todo
        );
        setTodos(updatedTodos);
        saveTodos(updatedTodos);
        
        // Удаляем задачу через 5 секунд после завершения
        setTimeout(() => {
          setTodos(prevTodos => {
            const filteredTodos = prevTodos.filter(todo => todo.id !== id);
            saveTodos(filteredTodos);
            return filteredTodos;
          });
        }, 5000);
      }
    }
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
          margin: '16px 0',
          fontSize: '32px',
          fontWeight: 'bold',
          fontFamily: "'SF Pro Display', sans-serif",
          color: themeColors.textColor
        }}
      >
        <span style={{ 
          color: themeColors.buttonColor,
          marginRight: '4px',
          fontWeight: 700,
        }}>
          {completedCount}
        </span>
        <span style={{ 
          color: themeColors.hintColor,
          marginRight: '4px',
          fontWeight: 400,
        }}>
          /
        </span>
        <span style={{ 
          color: themeColors.hintColor,
          fontWeight: 400,
        }}>
          {todos.length}
        </span>
      </div>
      
      <List style={{ paddingBottom: '10px' }}>
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
          marginTop: 16, 
          marginBottom: 16,
          width: '100%', 
          backgroundColor: '#000000', 
          color: '#FFFFFF',
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontFamily: "'SF Pro Display', sans-serif",
          fontWeight: 500,
          fontSize: '16px'
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
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