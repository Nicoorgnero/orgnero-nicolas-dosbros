import databaseRepository from './databaseRepository.js';

class BarberoRepository {
    findAll({ includeInactive = false } = {}) {
        const barberos = databaseRepository.read().barberos;
        return includeInactive ? barberos : barberos.filter((barbero) => barbero.activo);
    }

    findById(id) {
        return databaseRepository.read().barberos.find((barbero) => barbero.id === id) || null;
    }

    create(barbero) {
        return databaseRepository.update((data) => {
            data.barberos.push(barbero);
            return barbero;
        });
    }

    update(id, changes) {
        return databaseRepository.update((data) => {
            const index = data.barberos.findIndex((barbero) => barbero.id === id);
            if (index === -1) {
                return null;
            }

            data.barberos[index] = { ...data.barberos[index], ...changes, id };
            return data.barberos[index];
        });
    }
}

export default new BarberoRepository();
