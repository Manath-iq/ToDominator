import { useState, useEffect } from 'react';
import { List } from '@telegram-apps/telegram-ui';
import { v4 as uuidv4 } from 'uuid';
import { initData } from '@telegram-apps/sdk-react';
import { Todo } from './Todo';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  onCountsChange?: (completed: number, total: number) => void;
}

export const TodoList = ({ onCountsChange }: TodoListProps) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Получаем ID пользователя для хранения задач
  const user = initData.user();
  const userId = user?.id?.toString() || 'anonymous';
  const storageKey = `todos_${userId}`;

  // Функция для обновления счетчиков задач
  const updateCounts = (todosList: TodoItem[]) => {
    const completed = todosList.filter(todo => todo.completed).length;
    
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
  
  const handleAddTask = () => {
    // Создаем новую пустую задачу
    const newTodoId = uuidv4();
    const newTodo: TodoItem = {
      id: newTodoId,
      text: '',
      completed: false
    };
    
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    // Не сохраняем в localStorage пока пользователь не введет текст
    setEditingId(newTodoId);
  };
  
  const handleTextChange = (id: string, text: string) => {
    // Обновляем текст задачи во время редактирования
    setTodos(prevTodos => 
      prevTodos.map(todo => 
        todo.id === id ? { ...todo, text } : todo
      )
    );
  };
  
  const handleBlur = (_id: string) => {
    // Сохраняем задачу при потере фокуса
    setEditingId(null);
    
    const updatedTodos = todos.map(todo => ({
      ...todo,
      text: todo.text.trim()
    }));
    
    // Удаляем пустые задачи
    const filteredTodos = updatedTodos.filter(todo => todo.text !== '');
    
    setTodos(filteredTodos);
    saveTodos(filteredTodos);
  };
  
  // Добавляем обработчик для кнопки New Task
  useEffect(() => {
    const addTaskButton = document.querySelector('button[data-add-task]');
    if (addTaskButton) {
      const button = addTaskButton as HTMLButtonElement;
      button.onclick = handleAddTask;
    }
    
    return () => {
      if (addTaskButton) {
        (addTaskButton as HTMLButtonElement).onclick = null;
      }
    };
  }, [todos]);
  
  return (
    <div style={{ 
      width: '100%',
      boxSizing: 'border-box' as const,
      maxWidth: '100%',
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: '20px'
    }}>
      <List style={{ 
        paddingBottom: '8px', 
        width: '100%', 
        maxWidth: '100%',
        boxSizing: 'border-box' as const,
        padding: 0,
        margin: 0
      }}>
        {todos.map(todo => (
          <Todo
            key={todo.id}
            id={todo.id}
            text={todo.text}
            completed={todo.completed}
            onToggle={handleToggle}
            isEditing={todo.id === editingId}
            onTextChange={handleTextChange}
            onBlur={handleBlur}
          />
        ))}
      </List>
      
      {/* Скрытая кнопка-триггер для добавления задачи */}
      <div style={{ display: 'none' }}>
        <button 
          onClick={handleAddTask}
          data-add-task="true"
        >
          New Task
        </button>
      </div>
    </div>
  );
}; 