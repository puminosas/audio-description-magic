
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import Generator from './pages/Generator';
import { AuthProvider } from './context/AuthContext';
import Pricing from './pages/Pricing';
import IntegrationDocs from './pages/IntegrationDocs';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Generator />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/integration-docs",
    element: <IntegrationDocs />,
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
