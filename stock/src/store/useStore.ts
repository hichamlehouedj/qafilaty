import createAppSlice from "./createAppSlice";
import createUserSlice from "./createUserSlice";
import createNotificationSlice from "./createNotificationSlice";
import createPointsSlice from "./createPointsSlice";

import { devtools } from "zustand/middleware";
import create from "zustand";

const useStore = create(
  devtools((set, get) => ({
    ...createAppSlice(set, get),
    ...createUserSlice(set, get),
    ...createNotificationSlice(set, get),
    ...createPointsSlice(set, get)
  }))
);

export default useStore;
