const businessInfo = {
    nombre: 'Dos Bros',
    direccion: 'Av. Albarellos 2400',
    horario: 'Lunes a sábado, de 10:00 a 20:00',
    diasAtencion: [1, 2, 3, 4, 5, 6],
    horarioApertura: '10:00',
    horarioCierre: '20:00'
};

class BusinessService {
    getInfo() {
        return { ...businessInfo, diasAtencion: [...businessInfo.diasAtencion] };
    }
}

export default new BusinessService();
