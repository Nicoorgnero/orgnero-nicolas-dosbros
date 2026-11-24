import { formatDate } from '../utils/formatDate.js';
import { canChangeTurno } from '../utils/turnoRules.js';

function hasStarted(turno) {
    return new Date(turno.fechaHoraInicio) <= new Date();
}

function hasFinished(turno) {
    const endTime = new Date(turno.fechaHoraInicio).getTime()
        + Number(turno.duracionMinutos || 0) * 60 * 1000;
    return endTime <= Date.now();
}

export default function TurnosList({
    turnos,
    user,
    busy,
    onEdit,
    onCancel,
    onChangeStatus
}) {
    if (turnos.length === 0) {
        return <p className="empty-state">Todavía no hay turnos registrados.</p>;
    }

    const isStaff = user?.rol === 'administrador' || user?.rol === 'barbero';

    return (
        <div className="table-wrapper">
            <table>
                <caption className="visually-hidden">Turnos registrados</caption>
                <thead>
                    <tr>
                        <th scope="col">Fecha y hora</th>
                        <th scope="col">Estado</th>
                        {isStaff && <th scope="col">Cliente</th>}
                        {user?.rol !== 'barbero' && <th scope="col">Barbero</th>}
                        <th scope="col">Servicio</th>
                        <th scope="col">Observaciones</th>
                        <th scope="col">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {turnos.map((turno) => (
                        <tr key={turno.id}>
                            <td>{formatDate(turno.fechaHoraInicio)}</td>
                            <td><span className={`status status--${turno.estado.toLowerCase().replaceAll(' ', '-')}`}>
                                {turno.estado}
                            </span></td>
                            {isStaff && <td>{turno.clienteNombre}</td>}
                            {user?.rol !== 'barbero' && <td>{turno.barberoNombre}</td>}
                            <td>{turno.servicioNombre}</td>
                            <td>{turno.observaciones || '—'}</td>
                            <td>
                                <div className="row-actions">
                                    {user?.rol === 'cliente' && canChangeTurno(turno) && (
                                        <button className="button button--small button--secondary" type="button"
                                            onClick={() => onEdit(turno)} disabled={busy}
                                            aria-label={`Modificar turno del ${formatDate(turno.fechaHoraInicio)}`}>
                                            Modificar
                                        </button>
                                    )}
                                    {isStaff && turno.estado === 'Pendiente' && (
                                        <button className="button button--small button--primary" type="button"
                                            onClick={() => onChangeStatus(turno, 'Confirmado')} disabled={busy}>
                                            Confirmar
                                        </button>
                                    )}
                                    {isStaff && turno.estado === 'Confirmado' && (
                                        <>
                                            <button className="button button--small button--primary" type="button"
                                                onClick={() => onChangeStatus(turno, 'En curso')}
                                                disabled={busy || !hasStarted(turno)}>
                                                Iniciar
                                            </button>
                                            <button className="button button--small button--secondary" type="button"
                                                onClick={() => onChangeStatus(turno, 'No asistio')}
                                                disabled={busy || !hasStarted(turno)}>
                                                No asistió
                                            </button>
                                        </>
                                    )}
                                    {isStaff && turno.estado === 'En curso' && (
                                        <button className="button button--small button--primary" type="button"
                                            onClick={() => onChangeStatus(turno, 'Finalizado')}
                                            disabled={busy || !hasFinished(turno)}>
                                            Finalizar
                                        </button>
                                    )}
                                    {canChangeTurno(turno) && (
                                        <button className="button button--small button--danger" type="button"
                                            onClick={() => onCancel(turno)} disabled={busy}
                                            aria-label={`Cancelar turno del ${formatDate(turno.fechaHoraInicio)}`}>
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
