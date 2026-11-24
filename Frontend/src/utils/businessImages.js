import barberiaFrente from '../assets/barberia-frente.png';
import barberiaFrenteUno from '../assets/barberia-frente-1.png';
import barberiaInterior from '../assets/barberia-interior.png';
import barberiaPortada from '../assets/barberia-portada.png';
import lowFade from '../assets/low-fade.png';
import taperFade from '../assets/taper-fade.png';
import tintura from '../assets/tintura.png';

export const businessImages = {
    coverImage: barberiaPortada,
    interiorImage: barberiaInterior,
    locationImages: [
        {
            image: barberiaFrenteUno,
            alt: 'Vista lateral de la entrada de Dos Bros'
        },
        {
            image: barberiaFrente,
            alt: 'Vista exterior de la barbería Dos Bros'
        }
    ],
    serviceImages: {
        'servicio-low-fade': {
            image: lowFade,
            alt: 'Corte low fade de perfil',
            position: 'center 45%'
        },
        'servicio-taper-fade': {
            image: taperFade,
            alt: 'Corte taper fade de perfil',
            position: 'center 40%'
        },
        'servicio-tintura': {
            image: tintura,
            alt: 'Corte con tintura clara',
            position: 'center 45%'
        }
    }
};
