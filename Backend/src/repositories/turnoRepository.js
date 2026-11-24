import databaseRepository from './databaseRepository.js';

class TurnoRepository {
    findAll() {
        return databaseRepository.read().turnos;
    }

    findById(id) {
        return databaseRepository.read().turnos.find((turno) => turno.id === id) || null;
    }

    findByClienteId(clienteId) {
        return databaseRepository.read().turnos
            .filter((turno) => turno.clienteId === clienteId);
    }

    findByBarberoId(barberoId) {
        return databaseRepository.read().turnos
            .filter((turno) => turno.barberoId === barberoId);
    }

    create(turno) {
        return databaseRepository.update((data) => {
            data.turnos.push(turno);
            return turno;
        });
    }

    update(id, changes) {
        return databaseRepository.update((data) => {
            const index = data.turnos.findIndex((turno) => turno.id === id);
            if (index === -1) {
                return null;
            }

            data.turnos[index] = { ...data.turnos[index], ...changes, id };
            return data.turnos[index];
        });
    }
}

export default new TurnoRepository();
