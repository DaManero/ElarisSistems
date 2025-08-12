import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PersonAdd,
  Delete,
  Block,
  CheckCircle,
  ToggleOn,
  ToggleOff,
} from "@mui/icons-material";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import UserForm from "./UserForm";

const UserList = () => {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Estados para modal de formulario
  const [showUserForm, setShowUserForm] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  // Estados para modal de eliminación
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    loadUsers();
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
      setError("");
    } catch (error) {
      setError(error.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar el modal del formulario
  const handleCreateUser = () => {
    setUserToEdit(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setShowUserForm(true);
  };

  const handleCloseForm = () => {
    setShowUserForm(false);
    setUserToEdit(null);
  };

  const handleFormSuccess = () => {
    loadUsers();
    setShowUserForm(false);
    setUserToEdit(null);
  };

  // Función para cambiar estado del usuario
  const handleToggleStatus = async (user) => {
    try {
      await userService.updateUser(user.id, {
        status: !user.status,
      });
      await loadUsers();
    } catch (error) {
      setError(error.message || "Error updating user status");
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = async () => {
    try {
      await userService.deleteUser(selectedUser.id);
      await loadUsers();
      setDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      setError(error.message || "Error deleting user");
    }
  };

  // Funciones auxiliares
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#1C1C26";
      case "seller":
        return "#6A736A";
      case "viewer":
        return "#BEBFBD";
      default:
        return "#6A736A";
    }
  };

  const getRoleColorMUI = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "seller":
        return "primary";
      case "viewer":
        return "secondary";
      default:
        return "default";
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: "#1C1C26", fontWeight: 500 }}>
          Lista de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={handleCreateUser}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            bgcolor: "#1C1C26",
            "&:hover": { bgcolor: "#0D0D0D" },
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Card
        sx={{ borderRadius: 4, border: "1px solid rgba(190, 191, 189, 0.15)" }}
      >
        <CardContent
          sx={{
            p: 0,
            paddingBottom: "1px !important",
            "&:last-child": {
              paddingBottom: "1px",
            },
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F5F6F7" }}>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Usuario
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Rol
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Estado
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Último Login
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: "#6A736A",
                      fontSize: "0.875rem",
                    }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      bgcolor: "#FDFDFD",
                      "&:hover": {
                        bgcolor: "#F8F9FA",
                      },
                      borderBottom: "1px solid #F0F0F0",
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#6A736A",
                          fontFamily: "monospace",
                          fontSize: "0.85rem",
                        }}
                      >
                        #{user.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: getRoleColor(user.role),
                            width: 40,
                            height: 40,
                            fontSize: "0.875rem",
                          }}
                        >
                          {getInitials(user.first_name, user.last_name)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: "#1C1C26" }}
                          >
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#6A736A" }}
                          >
                            {user.phone || "Sin teléfono"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "#1C1C26" }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColorMUI(user.role)}
                        sx={{
                          textTransform: "capitalize",
                          fontSize: "0.75rem",
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {/* Toggle Switch Elegante */}
                        <Box
                          onClick={() => {
                            console.log("Toggle status for:", user);
                            handleToggleStatus(user);
                          }}
                          sx={{
                            width: 48,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: user.status
                              ? "#4CAF50"
                              : "#E0E0E0",
                            cursor: "pointer",
                            position: "relative",
                            transition: "all 0.3s ease",
                            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                            "&:hover": {
                              backgroundColor: user.status
                                ? "#45A049"
                                : "#D0D0D0",
                              transform: "scale(1.02)",
                            },
                          }}
                        >
                          {/* Círculo del switch */}
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              backgroundColor: "#FFFFFF",
                              position: "absolute",
                              top: 2,
                              left: user.status ? 26 : 2,
                              transition: "all 0.3s ease",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8px",
                            }}
                          >
                            {user.status ? "✓" : "✕"}
                          </Box>
                        </Box>

                        {/* Texto del estado */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: user.status ? "#4CAF50" : "#9E9E9E",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            minWidth: 60,
                          }}
                        >
                          {user.status ? "Activo" : "Inactivo"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "#6A736A", fontSize: "0.875rem" }}
                      >
                        {formatDate(user.last_login)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Botón Editar */}
                        <Box
                          onClick={() => handleEditUser(user)}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6B7280",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#3B82F6",
                              borderColor: "#3B82F6",
                              color: "#FFFFFF",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                            },
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="m18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Box>

                        {/* Botón Eliminar */}
                        <Box
                          onClick={() => {
                            console.log("Delete clicked for:", user);
                            setSelectedUser(user);
                            setDeleteDialog(true);
                          }}
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#6B7280",
                            backgroundColor: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "#EF4444",
                              borderColor: "#EF4444",
                              color: "#FFFFFF",
                              transform: "translateY(-1px)",
                              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                            },
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3,6 5,6 21,6" />
                            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => {
          setDeleteDialog(false);
          setSelectedUser(null);
        }}
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar al usuario{" "}
            <strong>
              {selectedUser?.first_name} {selectedUser?.last_name}
            </strong>
            ?
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "#6A736A" }}>
            Esta acción desactivará al usuario pero no eliminará su historial.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setDeleteDialog(false);
              setSelectedUser(null);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal del Formulario de Usuario */}
      <UserForm
        open={showUserForm}
        userData={userToEdit}
        onClose={handleCloseForm}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default UserList;
