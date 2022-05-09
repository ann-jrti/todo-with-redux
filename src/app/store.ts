import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import todoReducer from '../features/tasks/taskSlice';
import filterReducer from '../features/tasks/filterTaskSlice';

export const store = configureStore({
  reducer: {
    todos: todoReducer,
    filter: filterReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
