import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, quickLoginAs } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingrese su usuario y contraseña para continuar.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setErrorMessage(result.message || 'Credenciales incorrectas. Verifique sus datos.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Container with restrained elevation and subtle border */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900 text-blue-400 mb-4 shadow-inner">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Útiles Express
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Sistema de gestión de ventas e inventario
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <span>Acceso exclusivo del personal</span>
            <span aria-hidden="true">·</span>
            <span>Versión Interna 2.4</span>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Usuario o Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="ejemplo: vendedor@utilesexpress.pe"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border text-sm text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors ${
                  hasSubmitted && !email.trim()
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                autoComplete="username"
              />
            </div>
            {hasSubmitted && !email.trim() && (
              <p className="mt-1 text-xs text-red-600 font-medium">El usuario es requerido.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-2.5 bg-white border text-sm text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors ${
                  hasSubmitted && !password.trim()
                    ? 'border-red-400 bg-red-50/20'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {hasSubmitted && !password.trim() && (
              <p className="mt-1 text-xs text-red-600 font-medium">La contraseña es requerida.</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-slate-600">Recordar usuario</span>
            </label>
            <span className="text-xs text-slate-400">Soporte TI: anexo 104</span>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
          >
            <span>Iniciar sesión</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Buttons for Testing */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Acceso Rápido para Demostración
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => quickLoginAs('seller')}
              className="flex items-center justify-center gap-2 p-2.5 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-left transition-all group"
            >
              <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                  Vendedor
                </div>
                <div className="text-[11px] text-slate-400">Carlos Díaz</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => quickLoginAs('admin')}
              className="flex items-center justify-center gap-2 p-2.5 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-lg text-left transition-all group"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                  Administrador
                </div>
                <div className="text-[11px] text-slate-400">Laura Mendoza</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="mt-6 text-xs text-slate-400 text-center">
        © 2026 Útiles Express — Uso interno confidencial
      </footer>
    </div>
  );
};
