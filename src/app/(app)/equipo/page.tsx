"use client";

import { useState, useEffect } from "react";
import { Users, Shield, User, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "member";
  created_at: string;
}

export default function EquipoPage() {
  const { user: currentUser, isAdmin } = useUser();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch {
        // ignore
      }
      setLoading(false);
    }
    loadUsers();
  }, [isAdmin]);

  async function handleRoleChange(userId: string, newRole: "admin" | "member") {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u))
        );
      } else {
        const err = await res.json();
        alert(err.error || "Error al cambiar rol");
      }
    } catch {
      alert("Error de conexion");
    }
    setUpdatingId(null);
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-16">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Acceso restringido
        </h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Solo los administradores pueden gestionar el equipo.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "admin");
  const members = users.filter((u) => u.role === "member");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Gestion de Equipo
        </h2>
        <p className="text-gray-500 mt-1">
          Administra los usuarios y sus permisos
        </p>
      </div>

      {/* Admins section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Administradores ({admins.length})
        </h3>
        <div className="grid gap-3">
          {admins.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {u.full_name || u.email}
                  </p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Admin
                </span>
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => handleRoleChange(u.id, "member")}
                    disabled={updatingId === u.id}
                    className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {updatingId === u.id ? "..." : "Quitar admin"}
                  </button>
                )}
                {u.id === currentUser?.id && (
                  <span className="text-xs text-gray-400">(vos)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Members section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Miembros ({members.length})
        </h3>
        {members.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
            <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              No hay miembros registrados todavia.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Los usuarios se registran desde la pagina de login.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {members.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {u.full_name || u.email}
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    Miembro
                  </span>
                  <button
                    onClick={() => handleRoleChange(u.id, "admin")}
                    disabled={updatingId === u.id}
                    className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10 px-2 py-1 rounded transition-colors disabled:opacity-50"
                  >
                    {updatingId === u.id ? "..." : "Hacer admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions info */}
      <div className="border border-gray-200 rounded-lg bg-gray-50 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Permisos por Rol
        </h3>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4" />
              Administrador
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- Ver todas las canciones (publicadas y borradores)</li>
              <li>- Crear, editar y eliminar canciones</li>
              <li>- Publicar canciones en borrador</li>
              <li>- Ver archivos originales importados</li>
              <li>- Importar canciones desde Dropbox</li>
              <li>- Gestionar usuarios y roles</li>
              <li>- Crear y editar programas de culto</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-600 flex items-center gap-1.5 mb-2">
              <User className="w-4 h-4" />
              Miembro
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- Ver canciones publicadas</li>
              <li>- Transponer tonalidad</li>
              <li>- Cambiar tamanio de fuente</li>
              <li>- Cambiar notacion (cifrado/solfeo)</li>
              <li>- Ver programas de culto</li>
              <li>- Ver calendario</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
