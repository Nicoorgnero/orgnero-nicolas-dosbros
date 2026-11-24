import { useEffect, useState } from 'react';
import AdminCatalog from '../components/AdminCatalog.jsx';
import AuthPanel from '../components/AuthPanel.jsx';
import Notification from '../components/Notification.jsx';
import SetupAdminForm from '../components/SetupAdminForm.jsx';
import TurnoForm from '../components/TurnoForm.jsx';
import TurnosList from '../components/TurnosList.jsx';
import {
    getBusinessInfo,
    getBarbers,
    getServices
} from '../services/catalogService.js';
import {
    getCurrentUser,
    getSetupStatus,
    login,
    logout,
    registerCustomer,
    setupAdministrator
} from '../services/authService.js';
import {
    cancelTurno,
    changeTurnoStatus,
    createTurno,
    getTurnos,
    updateTurno
} from '../services/turnosService.js';
import { businessImages } from '../utils/businessImages.js';
import { canChangeTurno } from '../utils/turnoRules.js';

function formatPrice(value) {
    if (value === null || value === undefined) {
        return 'Precio a consultar';
    }
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2
    }).format(value);
}

export default function TurnosPage() {
    const [business, setBusiness] = useState(null);
    const [services, setServices] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [user, setUser] = useState(null);
    const [setupRequired, setSetupRequired] = useState(false);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingTurnos, setLoadingTurnos] = useState(false);
    const [busy, setBusy] = useState(false);
    const [editingTurno, setEditingTurno] = useState(null);
    const [formVersion, setFormVersion] = useState(0);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        let isActive = true;

        async function loadApplication() {
            const results = await Promise.allSettled([
                getBusinessInfo(),
                getServices(),
                getBarbers(),
                getSetupStatus(),
                getCurrentUser()
            ]);

            if (!isActive) {
                return;
            }

            const [businessResult, servicesResult, barbersResult, setupResult, userResult] = results;
            if (businessResult.status === 'fulfilled') {
                setBusiness(businessResult.value);
            }
            if (servicesResult.status === 'fulfilled') {
                setServices(servicesResult.value || []);
            }
            if (barbersResult.status === 'fulfilled') {
                setBarbers(barbersResult.value || []);
            }
            if (setupResult.status === 'fulfilled') {
                setSetupRequired(setupResult.value.requiereAdministrador);
            }
            if (userResult.status === 'fulfilled' && userResult.value) {
                setUser(userResult.value);
                setLoadingTurnos(true);
                try {
                    const accountTurnos = await getTurnos();
                    if (isActive) {
                        setTurnos(accountTurnos || []);
                    }
                } catch (error) {
                    if (isActive) {
                        setNotification({ type: 'error', message: error.message });
                    }
                } finally {
                    if (isActive) {
                        setLoadingTurnos(false);
                    }
                }
            }

            const failedRequest = results.find((result) => result.status === 'rejected');
            if (failedRequest) {
                setNotification({
                    type: 'error',
                    message: failedRequest.reason.message || 'No se pudo cargar la información del negocio.'
                });
            }
            setLoading(false);
        }

        loadApplication();
        return () => {
            isActive = false;
        };
    }, []);

    async function refreshPublicData() {
        const [serviceData, barberData] = await Promise.all([getServices(), getBarbers()]);
        setServices(serviceData || []);
        setBarbers(barberData || []);
    }

    async function refreshTurnos(account = user) {
        if (!account) {
            setTurnos([]);
            return;
        }

        setLoadingTurnos(true);
        try {
            setTurnos((await getTurnos()) || []);
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setLoadingTurnos(false);
        }
    }

    async function startSession(account) {
        setUser(account);
        setNotification({ type: 'success', message: 'Sesión iniciada correctamente.' });
        await refreshTurnos(account);
        return account;
    }

    async function handleLogin(credentials) {
        return startSession(await login(credentials));
    }

    async function handleRegister(accountData) {
        return startSession(await registerCustomer(accountData));
    }

    async function handleSetupAdministrator(accountData) {
        const administrator = await setupAdministrator(accountData);
        setSetupRequired(false);
        await startSession(administrator);
        await refreshPublicData();
    }

    async function handleLogout() {
        setBusy(true);
        try {
            await logout();
            setUser(null);
            setTurnos([]);
            setEditingTurno(null);
            setNotification({ type: 'success', message: 'Sesión cerrada.' });
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    async function handleSave(turnoData) {
        setBusy(true);
        setNotification(null);
        try {
            if (editingTurno) {
                await updateTurno(editingTurno.id, turnoData);
                setEditingTurno(null);
                setNotification({ type: 'success', message: 'Turno actualizado correctamente.' });
            } else {
                await createTurno(turnoData);
                setFormVersion((current) => current + 1);
                setNotification({ type: 'success', message: 'Solicitud registrada. Queda pendiente de confirmación.' });
            }
            await refreshTurnos(user);
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    async function handleCancel(turno) {
        if (!canChangeTurno(turno)) {
            return;
        }
        if (!window.confirm('¿Querés cancelar este turno?')) {
            return;
        }

        setBusy(true);
        setNotification(null);
        try {
            await cancelTurno(turno.id);
            if (editingTurno?.id === turno.id) {
                setEditingTurno(null);
            }
            setNotification({ type: 'success', message: 'Turno cancelado correctamente.' });
            await refreshTurnos(user);
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    async function handleStatusChange(turno, status) {
        setBusy(true);
        setNotification(null);
        try {
            await changeTurnoStatus(turno.id, status);
            setNotification({ type: 'success', message: `Turno actualizado: ${status}.` });
            await refreshTurnos(user);
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setBusy(false);
        }
    }

    const bookableServices = services.filter((service) => service.activo
        && Number.isInteger(service.duracionMinutos) && service.duracionMinutos > 0);
    const businessName = business?.nombre || 'DOS BROS';
    const isClient = user?.rol === 'cliente';
    return (
        <div className="app-shell">
            <header id="inicio">
                <div className="page-width header-inner">
                    <a className="brand" href="#inicio" aria-label={`${businessName}, inicio`}>
                        {businessName}
                    </a>
                    <nav className="main-nav" aria-label="Navegación principal">
                        <a href="#inicio">Inicio</a>
                        <a href="#nosotros">Nosotros</a>
                        <a href="#ubicacion">Ubicación</a>
                        <a href="#servicios">Servicios</a>
                        <a href="#turnos">Turnos</a>
                    </nav>
                </div>
            </header>

            <main>
                <section className="title" aria-labelledby="welcome-title">
                    <img
                        className="hero-image"
                        src={businessImages.coverImage}
                        alt="Frente de la barbería Dos Bros"
                    />
                    <div className="logo">
                        <h1 id="welcome-title">Bienvenido</h1>
                        <a className="button button--accent" href="#turnos">Solicitar turno</a>
                    </div>
                </section>

                <section className="section1 left" id="nosotros" aria-labelledby="about-title">
                    <img
                        className="section-image about-image"
                        src={businessImages.interiorImage}
                        alt="Interior de la barbería Dos Bros"
                    />
                    <div className="content-panel">
                        <h2 id="about-title">Sobre nosotros</h2>
                        <p>
                            {services.length
                                ? `Conocé los servicios de ${businessName}: ${services.map((service) => service.nombre).join(', ')}.`
                                : 'El catálogo de servicios se está configurando.'}
                        </p>
                    </div>
                </section>

                <section className="section1 right" id="ubicacion" aria-labelledby="location-title">
                    <div className="content-panel">
                        <h2 id="location-title">Ubicación</h2>
                        <p>{business?.direccion || 'Cargando dirección…'}</p>
                        <p>{business?.horario || 'Cargando horario…'}</p>
                    </div>
                    <div className="location-gallery">
                        {businessImages.locationImages.map((photo) => (
                            <img key={photo.alt} src={photo.image} alt={photo.alt} />
                        ))}
                    </div>
                </section>

                <section className="section2 services-section" id="servicios" aria-labelledby="services-title">
                    <div className="page-width">
                        <h2 id="services-title">Servicios y trabajos</h2>
                        {services.length === 0 ? (
                            <p className="empty-state">El catálogo de servicios todavía no está disponible.</p>
                        ) : (
                            <div className="service-layout">
                                {services.map((service) => {
                                    const photo = businessImages.serviceImages[service.id];
                                    return (
                                        <article className="service-card" key={service.id}>
                                            {photo && (
                                                <img
                                                    src={photo.image}
                                                    alt={photo.alt}
                                                    style={{ objectPosition: photo.position }}
                                                />
                                            )}
                                            <div className="service-card__info">
                                                <div className="service-card__heading">
                                                    <h3>{service.nombre}</h3>
                                                    <span className={service.activo ? 'service-state' : 'service-state service-state--inactive'}>
                                                        {service.activo ? 'Disponible' : 'Pendiente de configuración'}
                                                    </span>
                                                </div>
                                                {service.descripcion && <p>{service.descripcion}</p>}
                                                <div className="service-details">
                                                    <span>
                                                        {service.duracionMinutos
                                                            ? `${service.duracionMinutos} min`
                                                            : 'Duración pendiente'}
                                                    </span>
                                                    <span>{formatPrice(service.precio)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                <section className="section1 turnos-section" id="turnos" aria-labelledby="turnos-title">
                    <div className="turnos-inner">
                        <h2 id="turnos-title">
                            {user?.rol === 'administrador' ? 'Administración' : user?.rol === 'barbero' ? 'Mi agenda' : 'Turnos'}
                        </h2>
                        <p className="turnos-info">
                            {user
                                ? `${user.nombre} ${user.apellido} · ${user.rol}`
                                : 'Iniciá sesión o creá una cuenta de cliente para gestionar turnos.'}
                        </p>
                        {user && (
                            <div className="account-actions">
                                <button className="button button--secondary" type="button"
                                    onClick={handleLogout} disabled={busy}>
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                        <Notification notification={notification} onClose={() => setNotification(null)} />

                        {loading ? (
                            <p className="loading-state" role="status" aria-live="polite">Cargando la aplicación…</p>
                        ) : setupRequired ? (
                            <SetupAdminForm onSubmit={handleSetupAdministrator} />
                        ) : !user ? (
                            <AuthPanel onLogin={handleLogin} onRegister={handleRegister} />
                        ) : (
                            <>
                                {user.rol === 'administrador' && (
                                    <AdminCatalog onCatalogChange={refreshPublicData} />
                                )}
                                <div className={`turnos-grid${isClient ? '' : ' turnos-grid--single'}`}>
                                    {isClient && (
                                        <section className="panel" aria-labelledby="form-title">
                                            <h3 id="form-title">{editingTurno ? 'Modificar turno' : 'Solicitar turno'}</h3>
                                            {bookableServices.length === 0 || barbers.length === 0 ? (
                                                <p className="empty-state">
                                                    Los servicios y barberos deben estar configurados para solicitar un turno.
                                                </p>
                                            ) : (
                                                <TurnoForm
                                                    key={`turno-${editingTurno?.id || 'nuevo'}-${formVersion}`}
                                                    turno={editingTurno}
                                                    services={bookableServices}
                                                    barbers={barbers}
                                                    busy={busy}
                                                    onSubmit={handleSave}
                                                    onCancel={() => setEditingTurno(null)}
                                                    onValidationError={(message) =>
                                                        setNotification({ type: 'error', message })
                                                    }
                                                />
                                            )}
                                        </section>
                                    )}
                                    <section className="panel" aria-labelledby="turnos-list-title">
                                        <h3 id="turnos-list-title">
                                            {user.rol === 'administrador'
                                                ? 'Todos los turnos'
                                                : user.rol === 'barbero'
                                                    ? 'Turnos de mi agenda'
                                                    : 'Mis turnos'}
                                        </h3>
                                        {loadingTurnos ? (
                                            <p className="loading-state" role="status" aria-live="polite">
                                                Cargando turnos…
                                            </p>
                                        ) : (
                                            <TurnosList
                                                turnos={turnos}
                                                user={user}
                                                busy={busy}
                                                onEdit={setEditingTurno}
                                                onCancel={handleCancel}
                                                onChangeStatus={handleStatusChange}
                                            />
                                        )}
                                    </section>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <footer>
                <div className="page-width footer-inner">
                    <p>{businessName}</p>
                </div>
            </footer>
        </div>
    );
}
