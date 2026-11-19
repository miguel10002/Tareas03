import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../../../shared/types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCheck, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  X 
} from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const { users, addUser, toggleUserStatus, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim()) {
      setErrorMsg('Por favor complete los campos de Nombre y Correo.');
      return;
    }

    const emailExists = users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailExists) {
      setErrorMsg('Ya existe un usuario con este correo electrónico.');
      return;
    }

    addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      phone: phone.trim() || '+51 900 000 000',
      status: 'active',
      lastLogin: 'Nunca',
    });

    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setRole('seller');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Gestión de Personal y Control de Accesos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Usuarios autorizados para operar el punto de venta y la administración
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Empleado</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol en el Sistema</th>
                <th className="py-3 px-4">Teléfono de Contacto</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                const isAdmin = user.role === 'admin';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div>{user.name}</div>
                          {isCurrentUser && (
                            <span className="text-[10px] text-blue-600 font-semibold">(Tú)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isAdmin
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        <span>{isAdmin ? 'Administrador' : 'Vendedor'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {user.phone || 'No registrado'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {user.lastLogin || 'Hoy'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        user.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {user.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        disabled={isCurrentUser}
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                          isCurrentUser
                            ? 'opacity-30 cursor-not-allowed text-slate-400'
                            : user.status === 'active'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {user.status === 'active' ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nuevo Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="text-sm font-bold tracking-tight">Registrar Nuevo Empleado</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ej. Andrea Salas"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico (Usuario) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="asalas@utilesexpress.pe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rol Asignado *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="seller">Vendedor (Mostrador)</option>
                    <option value="admin">Administrador General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+51 9..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-[11px] leading-relaxed">
                El empleado podrá ingresar con su correo institucional. La contraseña inicial temporal asignada por defecto es <span className="font-mono font-bold text-slate-800">123456</span>.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
