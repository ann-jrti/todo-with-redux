import { createSlice } from '@reduxjs/toolkit';
import { TaskInterface } from '../../components/Task/Task';

export type filterStatus = 'none' | 'completed' | 'pending';
export type initialFilterState = { value: filterStatus };
let initialState: initialFilterState = { value: 'none' };

const filterCards = (filterValue: filterStatus, todos: TaskInterface[]) => {
  switch (filterValue) {
    case 'none': {
      return todos;
    }
    case 'completed': {
      const completedTasks = todos.filter((todo) => todo.completed);
      return completedTasks;
    }
    case 'pending': {
      const pendingTasks = todos.filter((todo) => !todo.completed);
      return pendingTasks;
    }
    default:
      return todos;
  }
};

const filterTaskSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilterStatus: (state, action) => {
      const filterStatus = action.payload;
      state.value = filterStatus;
    },
  },
});

export const { setFilterStatus } = filterTaskSlice.actions;

export const filteredTodosSelector = (store: any) => {
  const filterStatus = store.filter.value;
  const todos = store.todos.list;
  return filterCards(filterStatus, todos);
};

export default filterTaskSlice.reducer;
