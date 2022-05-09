import { Box } from '@mui/material';
import { Task } from '../Task/Task';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodos } from '../../features/tasks/taskSlice';

export const TaskList = () => {
  const dispatch = useDispatch();
  // const [tasks, setTasks] = useState<any[]>([]);
  const todos = useSelector((store: any) => store.todos);
  console.log('todos', todos.list);

  useEffect(() => {
    dispatch(getTodos());
  }, [dispatch]);

  return (
    <Box display="flex" flexDirection="column" gap="10px">
      {todos.list.map((task: any) => {
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
