const turnos = [];

class TurnoRepository {
    findAll() {
        return turnos.map((turno) => ({ ...turno }));
    }

    findById(id) {
        const turno = turnos.find((item) => item.id === id);
        return turno ? { ...turno } : null;
    }

    create(turno) {
        turnos.push(turno);
        return { ...turno };
    }

    update(id, changes) {
        const index = turnos.findIndex((turno) => turno.id === id);
        if (index === -1) {
            return null;
        }

        turnos[index] = { ...turnos[index], ...changes, id };
        return { ...turnos[index] };
    }

    deleteById(id) {
        const index = turnos.findIndex((turno) => turno.id === id);
        if (index === -1) {
            return null;
        }

        const [deletedTurno] = turnos.splice(index, 1);
        return { ...deletedTurno };
    }
}

export default new TurnoRepository();