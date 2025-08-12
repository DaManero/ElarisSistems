import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress, Alert } from "@mui/material";
import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import { userService } from "../services/userService";

// Wrapper component for user editing
const UserEditWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getUser(id);
        setUserData(response.data);
      } catch (error) {
        setError("Usuario no encontrado");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <UserForm
      userData={userData}
      onCancel={() => navigate("/dashboard/users/list")}
      onSuccess={() => navigate("/dashboard/users/list")}
    />
  );
};

// Wrapper component for user creation
const UserCreateWrapper = () => {
  const navigate = useNavigate();

  return (
    <UserForm
      onCancel={() => navigate("/dashboard/users/list")}
      onSuccess={() => navigate("/dashboard/users/list")}
    />
  );
};

// Placeholder for roles management
const UserRoles = () => (
  <Box sx={{ p: 4, textAlign: "center", color: "#6A736A" }}>
    <h3>Gestión de Roles</h3>
    <p>Este módulo estará disponible próximamente</p>
  </Box>
);

const Users = () => {
  const location = useLocation();

  // Debug: mostrar ruta actual
  console.log("Users component - Current path:", location.pathname);

  return (
    <Routes>
      {/* Lista de usuarios */}
      <Route path="list" element={<UserList />} />

      {/* Crear nuevo usuario */}
      <Route path="create" element={<UserCreateWrapper />} />

      {/* Editar usuario existente */}
      <Route path="edit/:id" element={<UserEditWrapper />} />

      {/* Gestión de roles */}
      <Route path="roles" element={<UserRoles />} />

      {/* Ruta por defecto - redirige a la lista */}
      <Route path="*" element={<UserList />} />
    </Routes>
  );
};

export default Users;
