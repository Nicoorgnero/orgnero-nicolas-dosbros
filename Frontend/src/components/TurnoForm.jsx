import { useEffect, useState } from 'react';
import { getDisponibilidad } from '../services/turnosService.js';
import { toDateInput } from '../utils/formatDate.js';

const emptyForm = {
    fecha: '',
    fechaHoraInicio: '',
    servicioId: '',
    barberoId: '',
    observaciones: ''
};

function getToday() {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires'
    }).format(new Date());
}

export default function TurnoForm({
    turno,
    services,
    barbers,
    busy,
    onSubmit,
    onCancel,
    onValidationError
}) {
    const [formData, setFormData] = useState(emptyForm);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState('');

    useEffect(() => {
        if (!turno) {
            setFormData(emptyForm);
            return;
        }

        setFormData({
            fecha: toDateInput(turno.fechaHoraInicio),
            fechaHoraInicio: turno.fechaHoraInicio,
            servicioId: turno.servicioId,
            barberoId: turno.barberoId,
            observaciones: turno.observaciones || ''
        });
    }, [turno]);

    useEffect(() => {
        if (!formData.fecha || !formData.servicioId || !formData.barberoId) {
            setSlots([]);
            setSlotError('');
            return undefined;
        }

        let isActive = true;
        setLoadingSlots(true);
        setSlotError('');

        getDisponibilidad({
            fecha: formData.fecha,
            servicioId: formData.servicioId,
            barberoId: formData.barberoId,
            turnoId: turno?.id
        })
            .then((data) => {
                if (isActive) {
                    setSlots(data || []);
                }
            })
            .catch((error) => {
                if (isActive) {
                    setSlots([]);
                    setSlotError(error.message);
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoadingSlots(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [formData.fecha, formData.servicioId, formData.barberoId, turno?.id]);

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
            ...(name === 'fecha' || name === 'servicioId' || name === 'barberoId'
                ? { fechaHoraInicio: '' }
                : {})
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        if (!formData.fecha || !formData.servicioId || !formData.barberoId
            || !formData.fechaHoraInicio) {
            onValidationError('Elegí un servicio, un barbero y un horario disponible.');
            return;
        }

        const selectedSlot = slots.find((slot) => slot.fechaHoraInicio === formData.fechaHoraInicio);
        if (!selectedSlot) {
            onValidationError('El horario seleccionado ya no está disponible. Elegí otro.');
            return;
        }

        onSubmit({
            fechaHoraInicio: selectedSlot.fechaHoraInicio,
            servicioId: formData.servicioId,
            barberoId: formData.barberoId,
            observaciones: formData.observaciones.trim()
        });
    }

    const currentServiceIsUnavailable = turno
        && !services.some((service) => service.id === turno.servicioId);
    const currentBarberIsUnavailable = turno
        && !barbers.some((barber) => barber.id === turno.barberoId);

    return (
        <form className="turno-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-field">
                    <label htmlFor="servicioId">Servicio *</label>
                    <select
                        id="servicioId"
                        name="servicioId"
                        value={formData.servicioId}
                        onChange={handleChange}
                        required
                        disabled={busy || services.length === 0}
                    >
                        <option value="">Elegí un servicio</option>
                        {currentServiceIsUnavailable && (
                            <option value={turno.servicioId}>
                                {turno.servicioNombre || 'Servicio actual (inactivo)'}
                            </option>
                        )}
                        {services.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.nombre}{service.precio === null ? ' · precio a consultar' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="barberoId">Barbero *</label>
                    <select
                        id="barberoId"
                        name="barberoId"
                        value={formData.barberoId}
                        onChange={handleChange}
                        required
                        disabled={busy || barbers.length === 0}
                    >
                        <option value="">Elegí un barbero</option>
                        {currentBarberIsUnavailable && (
                            <option value={turno.barberoId}>Barbero actual (inactivo)</option>
                        )}
                        {barbers.map((barber) => (
                            <option key={barber.id} value={barber.id}>
                                {barber.nombre} {barber.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label htmlFor="fecha">Día *</label>
                    <input
                        id="fecha"
                        name="fecha"
                        type="date"
                        value={formData.fecha}
                        min={getToday()}
                        onChange={handleChange}
                        required
                        disabled={busy}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="fechaHoraInicio">Horario disponible *</label>
                    <select
                        id="fechaHoraInicio"
                        name="fechaHoraInicio"
                        value={formData.fechaHoraInicio}
                        onChange={handleChange}
                        required
                        disabled={busy || loadingSlots || slots.length === 0}
                    >
                        <option value="">
                            {loadingSlots ? 'Consultando horarios…' : 'Elegí un horario'}
                        </option>
                        {slots.map((slot) => (
                            <option key={slot.fechaHoraInicio} value={slot.fechaHoraInicio}>
                                {slot.hora}
                            </option>
                        ))}
                    </select>
                    {slotError && <span className="field-message" role="alert">{slotError}</span>}
                    {!loadingSlots && !slotError && formData.fecha && formData.servicioId
                        && formData.barberoId && slots.length === 0 && (
                            <span className="field-message">No hay horarios disponibles para ese día.</span>
                        )}
                </div>

                <div className="form-field form-field--wide">
                    <label htmlFor="observaciones">Observaciones</label>
                    <textarea
                        id="observaciones"
                        name="observaciones"
                        rows="3"
                        value={formData.observaciones}
                        onChange={handleChange}
                        disabled={busy}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button className="button button--primary" type="submit" disabled={busy}>
                    {busy ? 'Guardando…' : turno ? 'Guardar cambios' : 'Solicitar turno'}
                </button>
                {turno && (
                    <button
                        className="button button--secondary"
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        Volver
                    </button>
                )}
            </div>
        </form>
    );
}
