import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TaskInterface } from '../../components/Task/Task';

// move to .env
const numberOfTasks: number = 6;
const todosAPI: string = `https://jsonplaceholder.typicode.com/todos?_start=0&_limit=${numberOfTasks}`;

export const getTodos: any = createAsyncThunk('todos/getTasks', async () => {
  const response = await fetch(todosAPI);
  return response.json();
});

const initialState: any = {
  list: [],
  status: null,
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    createNewTask: (state, action) => {
      const newTask = action.payload;
      state.list.push(newTask);
    },
    setTaskAsCompleted: (state, action) => {
      const id = action.payload;
      const found = state.list.find((task: TaskInterface) => task.id === id);
      found.completed = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTodos.fulfilled, (state, { payload }) => {
        state.list = payload;
        state.status = 'success';
      })
      .addCase(getTodos.rejected, (state) => {
        state.status = 'failed';
      });
  },
});
export const { createNewTask, setTaskAsCompleted } = todoSlice.actions;

export default todoSlice.reducer;
