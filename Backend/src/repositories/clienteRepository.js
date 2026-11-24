import databaseRepository from './databaseRepository.js';

class ClienteRepository {
    findAll() {
        return databaseRepository.read().clientes;
    }

    findById(id) {
        return databaseRepository.read().clientes.find((cliente) => cliente.id === id) || null;
    }

    create(cliente) {
        return databaseRepository.update((data) => {
            data.clientes.push(cliente);
            return cliente;
        });
    }
}

export default new ClienteRepository();
