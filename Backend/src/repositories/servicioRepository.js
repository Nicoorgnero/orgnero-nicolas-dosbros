import databaseRepository from './databaseRepository.js';

class ServicioRepository {
    findAll({ includeInactive = false } = {}) {
        const servicios = databaseRepository.read().servicios;
        return includeInactive ? servicios : servicios.filter((servicio) => servicio.activo);
    }

    findById(id) {
        return databaseRepository.read().servicios.find((servicio) => servicio.id === id) || null;
    }

    create(servicio) {
        return databaseRepository.update((data) => {
            data.servicios.push(servicio);
            return servicio;
        });
    }

    update(id, changes) {
        return databaseRepository.update((data) => {
            const index = data.servicios.findIndex((servicio) => servicio.id === id);
            if (index === -1) {
                return null;
            }

            data.servicios[index] = { ...data.servicios[index], ...changes, id };
            return data.servicios[index];
        });
    }
}

export default new ServicioRepository();
