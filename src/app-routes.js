import {
  ReportStructuresPage,
  MasterCalendarPage,
  UserCompanyPage,
} from "./pages";
import { withNavigationWatcher } from "./contexts/navigation";
//import path from "path-browserify";

const routes = [
  {
    path: "/reportStructures",
    element: ReportStructuresPage,
  },

  {
    path: "/masterCalendar",
    element: MasterCalendarPage,
  },
  {
    path: "/userCompany",
    element: UserCompanyPage,
  },
];

export default routes.map((route) => {
  return {
    ...route,
    element: withNavigationWatcher(route.element, route.path),
  };
});
