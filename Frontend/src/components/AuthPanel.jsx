import { useState } from 'react';
import Notification from './Notification.jsx';

const emptyAccount = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
};

export default function AuthPanel({ onLogin, onRegister }) {
    const [mode, setMode] = useState('login');
    const [formData, setFormData] = useState(emptyAccount);
    const [busy, setBusy] = useState(false);
    const [notification, setNotification] = useState(null);
    const isRegistering = mode === 'register';

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    }

    function changeMode(nextMode) {
        setMode(nextMode);
        setFormData(emptyAccount);
        setNotification(null);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setNotification(null);

        try {
            const user = isRegistering
                ? await onRegister(formData)
                : await onLogin({ email: formData.email, password: formData.password });
            setNotification({ type: 'success', message: 'Sesión iniciada correctamente.' });
            return user;
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
        return null;
    }

    return (
        <div className="auth-panel">
            <h3>{isRegistering ? 'Crear cuenta de cliente' : 'Iniciar sesión'}</h3>
            <p className="panel-intro">
                {isRegistering
                    ? 'Registrate para solicitar y consultar tus turnos.'
                    : 'Ingresá para gestionar tus turnos.'}
            </p>
            <Notification notification={notification} onClose={() => setNotification(null)} />

            <form onSubmit={handleSubmit}>
                {isRegistering && (
                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="registro-nombre">Nombre *</label>
                            <input id="registro-nombre" name="nombre" value={formData.nombre}
                                onChange={handleChange} autoComplete="given-name" required disabled={busy} />
                        </div>
                        <div className="form-field">
                            <label htmlFor="registro-apellido">Apellido *</label>
                            <input id="registro-apellido" name="apellido" value={formData.apellido}
                                onChange={handleChange} autoComplete="family-name" required disabled={busy} />
                        </div>
                    </div>
                )}

                <div className="form-field">
                    <label htmlFor="auth-email">Correo electrónico *</label>
                    <input id="auth-email" name="email" type="email" value={formData.email}
                        onChange={handleChange} autoComplete="email" required disabled={busy} />
                </div>

                {isRegistering && (
                    <div className="form-field">
                        <label htmlFor="registro-telefono">Teléfono</label>
                        <input id="registro-telefono" name="telefono" type="tel" value={formData.telefono}
                            onChange={handleChange} autoComplete="tel" disabled={busy} />
                    </div>
                )}

                <div className="form-field">
                    <label htmlFor="auth-password">Contraseña *</label>
                    <input id="auth-password" name="password" type="password" value={formData.password}
                        onChange={handleChange} autoComplete={isRegistering ? 'new-password' : 'current-password'}
                        minLength="8" required disabled={busy} />
                </div>

                <div className="form-actions">
                    <button className="button button--primary" type="submit" disabled={busy}>
                        {busy ? 'Procesando…' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
                    </button>
                </div>
            </form>

            <button className="text-button" type="button" onClick={() => changeMode(
                isRegistering ? 'login' : 'register'
            )} disabled={busy}>
                {isRegistering ? 'Ya tengo una cuenta' : 'Crear cuenta de cliente'}
            </button>
        </div>
    );
}
