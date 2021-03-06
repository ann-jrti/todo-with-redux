import { Box } from '@mui/material';
import { Task } from '../Task/Task';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodos } from '../../features/tasks/taskSlice';
import { filteredTodosSelector } from '../../features/tasks/filterTaskSlice';
import { TaskInterface } from '../Task/Task';

export const TaskList = () => {
  const dispatch = useDispatch();
  const todos = useSelector(filteredTodosSelector);

  useEffect(() => {
    if (todos.length === 0) dispatch(getTodos());
  }, []);

  return (
    <Box display="flex" alignItems="center" flexDirection="column" gap="10px">
      {todos.map((task: TaskInterface) => {
        return (
          <Task
            key={task.id}
            userId={task.userId}
            id={task.id}
            title={task.title}
            completed={task.completed}
          ></Task>
        );
      })}
    </Box>
  );
};
