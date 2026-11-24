class Usuario {
    constructor(id, nombre, apellido, email, rol, passwordSalt, passwordHash, clienteId = null, barberoId = null) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.email = email;
        this.rol = rol;
        this.passwordSalt = passwordSalt;
        this.passwordHash = passwordHash;
        this.clienteId = clienteId;
        this.barberoId = barberoId;
    }
}

export default Usuario;
