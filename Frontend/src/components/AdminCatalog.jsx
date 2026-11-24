import { useEffect, useState } from 'react';
import Notification from './Notification.jsx';
import {
    createBarber,
    createService,
    deactivateBarber,
    deactivateService,
    getAdminBarbers,
    getAdminServices,
    updateBarber,
    updateService
} from '../services/catalogService.js';

const emptyService = {
    nombre: '',
    descripcion: '',
    duracionMinutos: '',
    precio: '',
    activo: false
};

const emptyBarber = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: ''
};

export default function AdminCatalog({ onCatalogChange }) {
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [serviceForm, setServiceForm] = useState(emptyService);
    const [barberForm, setBarberForm] = useState(emptyBarber);
    const [editingService, setEditingService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadCatalog();
    }, []);

    async function loadCatalog() {
        setLoading(true);
        try {
            const [serviceData, barberData] = await Promise.all([
                getAdminServices(),
                getAdminBarbers()
            ]);
            setServices(serviceData || []);
            setBarbers(barberData || []);
            await onCatalogChange();
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    }

    function handleServiceChange(event) {
        const { name, value, checked, type } = event.target;
        setServiceForm((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    function handleBarberChange(event) {
        const { name, value } = event.target;
        setBarberForm((current) => ({ ...current, [name]: value }));
    }

    function editService(service) {
        setEditingService(service);
        setServiceForm({
            nombre: service.nombre,
            descripcion: service.descripcion || '',
            duracionMinutos: service.duracionMinutos ?? '',
            precio: service.precio ?? '',
            activo: service.activo
        });
    }

    function resetServiceForm() {
        setEditingService(null);
        setServiceForm(emptyService);
    }

    async function handleServiceSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setNotification(null);

        const service = {
            ...serviceForm,
            duracionMinutos: serviceForm.duracionMinutos === ''
                ? null
                : Number(serviceForm.duracionMinutos),
            precio: serviceForm.precio === '' ? null : Number(serviceForm.precio)
        };

        try {
            if (editingService) {
                await updateService(editingService.id, service);
            } else {
                await createService(service);
            }
            resetServiceForm();
            setNotification({ type: 'success', message: 'Servicio guardado correctamente.' });
            await loadCatalog();
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    async function handleBarberSubmit(event) {
        event.preventDefault();
        setBusy(true);
        setNotification(null);
        try {
            await createBarber(barberForm);
            setBarberForm(emptyBarber);
            setNotification({ type: 'success', message: 'Barbero agregado correctamente.' });
            await loadCatalog();
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    async function toggleService(service) {
        setBusy(true);
        setNotification(null);
        try {
            if (service.activo) {
                await deactivateService(service.id);
            } else {
                await updateService(service.id, { activo: true });
            }
            setNotification({
                type: 'success',
                message: service.activo ? 'Servicio desactivado.' : 'Servicio activado.'
            });
            await loadCatalog();
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    async function toggleBarber(barber) {
        setBusy(true);
        setNotification(null);
        try {
            if (barber.activo) {
                await deactivateBarber(barber.id);
            } else {
                await updateBarber(barber.id, { activo: true });
            }
            setNotification({
                type: 'success',
                message: barber.activo ? 'Barbero desactivado.' : 'Barbero activado.'
            });
            await loadCatalog();
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="admin-catalog" aria-labelledby="catalog-title">
            <div className="admin-heading">
                <h3 id="catalog-title">Administrar el negocio</h3>
                <p>Completá los datos reales para habilitar los turnos.</p>
            </div>
            <Notification notification={notification} onClose={() => setNotification(null)} />

            <div className="admin-grid">
                <section className="admin-card" aria-labelledby="services-admin-title">
                    <h4 id="services-admin-title">Servicios</h4>
                    <form onSubmit={handleServiceSubmit}>
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="servicio-nombre">Nombre *</label>
                                <input id="servicio-nombre" name="nombre" value={serviceForm.nombre}
                                    onChange={handleServiceChange} required disabled={busy} />
                            </div>
                            <div className="form-field">
                                <label htmlFor="servicio-duracion">Duración en minutos *</label>
                                <input id="servicio-duracion" name="duracionMinutos" type="number" min="1"
                                    value={serviceForm.duracionMinutos} onChange={handleServiceChange}
                                    required={serviceForm.activo} disabled={busy} />
                            </div>
                            <div className="form-field">
                                <label htmlFor="servicio-precio">Precio</label>
                                <input id="servicio-precio" name="precio" type="number" min="0" step="0.01"
                                    value={serviceForm.precio} onChange={handleServiceChange} disabled={busy} />
                            </div>
                            <div className="form-field form-field--wide">
                                <label htmlFor="servicio-descripcion">Descripción</label>
                                <textarea id="servicio-descripcion" name="descripcion" rows="2"
                                    value={serviceForm.descripcion} onChange={handleServiceChange} disabled={busy} />
                            </div>
                            <label className="checkbox-field">
                                <input type="checkbox" name="activo" checked={serviceForm.activo}
                                    onChange={handleServiceChange} disabled={busy} />
                                Disponible para reservar
                            </label>
                        </div>
                        <div className="form-actions">
                            <button className="button button--primary" type="submit" disabled={busy}>
                                {editingService ? 'Guardar servicio' : 'Agregar servicio'}
                            </button>
                            {editingService && (
                                <button className="button button--secondary" type="button"
                                    onClick={resetServiceForm} disabled={busy}>
                                    Dejar de editar
                                </button>
                            )}
                        </div>
                    </form>

                    {loading ? <p className="loading-state">Cargando servicios…</p> : (
                        <ul className="admin-list">
                            {services.map((service) => (
                                <li key={service.id}>
                                    <div>
                                        <strong>{service.nombre}</strong>
                                        <span>
                                            {service.duracionMinutos
                                                ? `${service.duracionMinutos} min`
                                                : 'Duración pendiente'}
                                            {' · '}
                                            {service.precio === null ? 'Precio pendiente' : `$${service.precio}`}
                                            {' · '}{service.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <div className="row-actions">
                                        <button className="button button--small button--secondary" type="button"
                                            onClick={() => editService(service)} disabled={busy}>
                                            Editar
                                        </button>
                                        <button className="button button--small button--danger" type="button"
                                            onClick={() => toggleService(service)} disabled={busy}>
                                            {service.activo ? 'Desactivar' : 'Activar'}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="admin-card" aria-labelledby="barbers-admin-title">
                    <h4 id="barbers-admin-title">Barberos</h4>
                    <form onSubmit={handleBarberSubmit}>
                        <div className="form-grid">
                            <div className="form-field">
                                <label htmlFor="barbero-nombre">Nombre *</label>
                                <input id="barbero-nombre" name="nombre" value={barberForm.nombre}
                                    onChange={handleBarberChange} required disabled={busy} />
                            </div>
                            <div className="form-field">
                                <label htmlFor="barbero-apellido">Apellido *</label>
                                <input id="barbero-apellido" name="apellido" value={barberForm.apellido}
                                    onChange={handleBarberChange} required disabled={busy} />
                            </div>
                            <div className="form-field">
                                <label htmlFor="barbero-email">Correo para iniciar sesión *</label>
                                <input id="barbero-email" name="email" type="email" value={barberForm.email}
                                    onChange={handleBarberChange} required disabled={busy} />
                            </div>
                            <div className="form-field">
                                <label htmlFor="barbero-telefono">Teléfono</label>
                                <input id="barbero-telefono" name="telefono" type="tel" value={barberForm.telefono}
                                    onChange={handleBarberChange} disabled={busy} />
                            </div>
                            <div className="form-field form-field--wide">
                                <label htmlFor="barbero-password">Contraseña inicial *</label>
                                <input id="barbero-password" name="password" type="password"
                                    value={barberForm.password} onChange={handleBarberChange} minLength="8"
                                    autoComplete="new-password" required disabled={busy} />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="button button--primary" type="submit" disabled={busy}>
                                Agregar barbero
                            </button>
                        </div>
                    </form>

                    {loading ? <p className="loading-state">Cargando barberos…</p> : (
                        <ul className="admin-list">
                            {barbers.map((barber) => (
                                <li key={barber.id}>
                                    <div>
                                        <strong>{barber.nombre} {barber.apellido}</strong>
                                        <span>{barber.email} · {barber.activo ? 'Activo' : 'Inactivo'}</span>
                                    </div>
                                    <button className="button button--small button--secondary" type="button"
                                        onClick={() => toggleBarber(barber)} disabled={busy}>
                                        {barber.activo ? 'Desactivar' : 'Activar'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </section>
    );
}
