import { useState, useEffect } from 'react';
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
  const statsKey = `todo_stats_${userId}`;
  
  // Функция для получения статистики из localStorage
  const getStats = () => {
    try {
      const statsJson = localStorage.getItem(statsKey);
      if (statsJson) {
        return JSON.parse(statsJson);
      }
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    }
    return { completed: 0, total: 0 };
  };
  
  // Функция для сохранения статистики в localStorage
  const saveStats = (completed: number, total: number) => {
    try {
      localStorage.setItem(statsKey, JSON.stringify({ completed, total }));
    } catch (error) {
      console.error('Ошибка при сохранении статистики:', error);
    }
  };

  // Функция для обновления счетчиков задач
  const updateCounts = (completedTask: boolean = false) => {
    // Получаем текущую статистику
    const stats = getStats();
    
    // Если задача была завершена, увеличиваем счетчик выполненных
    if (completedTask) {
      stats.completed += 1;
    }
    
    // Вычисляем общие показатели
    const totalCompleted = stats.completed;
    const totalTasks = stats.total;
    
    // Сохраняем обновленную статистику
    saveStats(totalCompleted, totalTasks);
    
    // Вызываем колбэк из родительского компонента
    if (onCountsChange) {
      onCountsChange(totalCompleted, totalTasks);
    }
    
    // Создаем собственное событие для информирования других компонентов
    window.dispatchEvent(new CustomEvent('todosUpdated'));
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    try {
      // Загружаем задачи
      const savedTodos = localStorage.getItem(storageKey);
      let parsedTodos: TodoItem[] = [];
      
      if (savedTodos) {
        parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos);
      } else {
        // Для новых пользователей - пустой массив задач
        setTodos([]);
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
      
      // Загружаем статистику
      const stats = getStats();
      
      // Инициализируем статистику, если нет сохраненной
      if (!stats.total) {
        saveStats(0, parsedTodos.length);
      }
      
      // Обновляем счетчики
      if (onCountsChange) {
        onCountsChange(stats.completed, stats.total);
      }
      
    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  }, [storageKey, onCountsChange]);

  // Сохранение в localStorage
  const saveTodos = (updatedTodos: TodoItem[], completedTask: boolean = false) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedTodos));
      updateCounts(completedTask);
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
        saveTodos(updatedTodos, true); // Отмечаем, что задача была выполнена
        
        // Удаляем задачу через 5 секунд после завершения
        setTimeout(() => {
          setTodos(prevTodos => {
            const filteredTodos = prevTodos.filter(todo => todo.id !== id);
            saveTodos(filteredTodos);
            return filteredTodos;
          });
        }, 500);
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
    
    // Добавляем новую задачу в начало массива, а не в конец
    const updatedTodos = [newTodo, ...todos];
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
    
    // Сохраняем исходное количество задач для сравнения
    const originalTodoCount = todos.length;
    
    const updatedTodos = todos.map(todo => ({
      ...todo,
      text: todo.text.trim()
    }));
    
    // Удаляем пустые задачи
    const filteredTodos = updatedTodos.filter(todo => todo.text !== '');
    
    // Получаем текущую статистику только один раз
    const stats = getStats();
    
    // Увеличиваем счетчик только если число задач с текстом увеличилось
    // Это происходит только когда была добавлена новая задача с текстом
    if (filteredTodos.length > originalTodoCount - 1) {
      // Добавлена как минимум одна новая задача с текстом
      // Увеличиваем счетчик на разницу между новым количеством и предыдущим
      saveStats(stats.completed, stats.total + (filteredTodos.length - (originalTodoCount - 1)));
    }
    
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
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: '0',
      overflow: 'hidden',
      paddingLeft: '0',
      paddingRight: '0',
      marginTop: '0'
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
    </div>
  );
}; 