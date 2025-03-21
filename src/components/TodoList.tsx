import { useState, useEffect } from 'react';
import { List, Button } from '@telegram-apps/telegram-ui';
import { v4 as uuidv4 } from 'uuid';
import { initData } from '@telegram-apps/sdk-react';
import { Todo } from './Todo';
import { AddTaskModal } from './AddTaskModal';
import { useThemeColors } from './theme';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  onCountsChange?: (completed: number, total: number) => void;
}

export const TodoList = ({ onCountsChange }: TodoListProps) => {
  const themeColors = useThemeColors();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Получаем ID пользователя для хранения задач
  const user = initData.user();
  const userId = user?.id?.toString() || 'anonymous';
  const storageKey = `todos_${userId}`;

  // Функция для обновления счетчиков задач
  const updateCounts = (todosList: TodoItem[]) => {
    const completed = todosList.filter(todo => todo.completed).length;
    setCompletedCount(completed);
    
    // Вызываем колбэк из родительского компонента, если он существует
    if (onCountsChange) {
      onCountsChange(completed, todosList.length);
    }
    
    // Создаем собственное событие для информирования других компонентов
    window.dispatchEvent(new CustomEvent('todosUpdated'));
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem(storageKey);
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos);
        updateCounts(parsedTodos);
      } else {
        // Для новых пользователей - пустой массив задач
        setTodos([]);
        updateCounts([]);
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  }, [storageKey, onCountsChange]);

  // Сохранение в localStorage
  const saveTodos = (updatedTodos: TodoItem[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedTodos));
      updateCounts(updatedTodos);
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
      
      {/* Скрытая кнопка-триггер для открытия модального окна */}
      <div style={{ display: 'none' }}>
        <button 
          onClick={() => setIsModalOpen(true)}
          data-add-task="true"
        >
          New Task
        </button>
      </div>
      
      {isModalOpen && (
        <AddTaskModal
          onClose={() => setIsModalOpen(false)}
          onAddTask={handleAddTask}
        />
      )}
    </div>
  );
}; 