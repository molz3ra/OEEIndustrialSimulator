import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import LoginPage from "@/pages/login";
import OperatorPage from "@/pages/operator";
import DashboardPage from "@/pages/dashboard";
import ProductionPage from "@/pages/production";
import MachinesPage from "@/pages/machines";
import NotFoundPage from "@/pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/operador" replace />,
          },
          {
            path: "operador",
            element: <OperatorPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "producao",
            element: <ProductionPage />,
          },
          {
            path: "maquinas",
            element: <MachinesPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
