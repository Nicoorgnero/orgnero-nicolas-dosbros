import databaseRepository from './databaseRepository.js';

class UsuarioRepository {
    findAll() {
        return databaseRepository.read().usuarios;
    }

    findById(id) {
        return databaseRepository.read().usuarios.find((usuario) => usuario.id === id) || null;
    }

    findByEmail(email) {
        return databaseRepository.read().usuarios.find((usuario) => usuario.email === email) || null;
    }

    findAdministrator() {
        return databaseRepository.read().usuarios
            .find((usuario) => usuario.rol === 'administrador') || null;
    }

    create(usuario) {
        return databaseRepository.update((data) => {
            data.usuarios.push(usuario);
            return usuario;
        });
    }

    update(id, changes) {
        return databaseRepository.update((data) => {
            const index = data.usuarios.findIndex((usuario) => usuario.id === id);
            if (index === -1) {
                return null;
            }

            data.usuarios[index] = { ...data.usuarios[index], ...changes, id };
            return data.usuarios[index];
        });
    }
}

export default new UsuarioRepository();
