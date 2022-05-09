import { Box } from '@mui/material';
import { Task } from '../Task/Task';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTodos } from '../../features/tasks/taskSlice';
import { filterStatus } from '../../features/tasks/filterTaskSlice';
import { TaskInterface } from '../Task/Task';
import { filteredTodosSelector } from '../../features/tasks/filterTaskSlice';

export const TaskList = () => {
  const dispatch = useDispatch();
  const todos = useSelector(filteredTodosSelector);
  console.log(todos);
  let filter = useSelector((store: any) => store.filter.value);

  useEffect(() => {
    dispatch(getTodos());
  }, [dispatch]);

  return (
    <Box display="flex" flexDirection="column" gap="10px">
      {todos.map((task: any) => {
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
