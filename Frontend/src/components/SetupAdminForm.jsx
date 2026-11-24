import { useState } from 'react';
import Notification from './Notification.jsx';

const emptyForm = { nombre: '', apellido: '', email: '', password: '' };

export default function SetupAdminForm({ onSubmit }) {
    const [formData, setFormData] = useState(emptyForm);
    const [busy, setBusy] = useState(false);
    const [notification, setNotification] = useState(null);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setNotification(null);
        try {
            await onSubmit(formData);
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="setup-panel">
            <h3>Configuración inicial</h3>
            <p className="panel-intro">
                Creá la cuenta administradora para cargar los servicios y barberos reales del local.
            </p>
            <Notification notification={notification} onClose={() => setNotification(null)} />
            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="admin-nombre">Nombre *</label>
                        <input id="admin-nombre" name="nombre" value={formData.nombre}
                            onChange={handleChange} autoComplete="given-name" required disabled={busy} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="admin-apellido">Apellido *</label>
                        <input id="admin-apellido" name="apellido" value={formData.apellido}
                            onChange={handleChange} autoComplete="family-name" required disabled={busy} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="admin-email">Correo electrónico *</label>
                        <input id="admin-email" name="email" type="email" value={formData.email}
                            onChange={handleChange} autoComplete="email" required disabled={busy} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="admin-password">Contraseña *</label>
                        <input id="admin-password" name="password" type="password" value={formData.password}
                            onChange={handleChange} autoComplete="new-password" minLength="8"
                            required disabled={busy} />
                    </div>
                </div>
                <div className="form-actions">
                    <button className="button button--primary" type="submit" disabled={busy}>
                        {busy ? 'Guardando…' : 'Crear administrador'}
                    </button>
                </div>
            </form>
        </div>
    );
}
