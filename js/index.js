const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

document.addEventListener('DOMContentLoaded', ()  => {
    fetchData();
    if(localStorage.getItem('carrito')){
        carrito = JSON.parse(localStorage.getItem('carrito'));
        pintarCarrito();
    }
});

cards.addEventListener('click', e =>{
    addCarrito(e);
});

items.addEventListener('click', e => { 
    btnAumentarDisminuir(e); 
});

const fetchData = async () => {
    try {
        const res = await fetch('../js/api.json');
        const data = await res.json();
        pintarCards(data);
    }
    catch (error){
        console.log(error);
    }
};

const pintarCards = data => {
    data.forEach(producto => {
        templateCard.querySelector('h5').textContent = producto.title;
        templateCard.querySelector('p').textContent = producto.precio;
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl);
        templateCard.querySelector('.btn').dataset.id = producto.id;
        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    });
    cards.appendChild(fragment);
};

const addCarrito = e => {
    if(e.target.classList.contains('btn')){
        setCarrito(e.target.parentElement);
    };
    e.stopPropagation();
};

const setCarrito = objeto =>{
    const producto = {
        id: objeto.querySelector('.btn').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    };
    if(carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1;
    };
    carrito[producto.id] = {...producto};
    pintarCarrito();
};

const pintarCarrito = () => {
    items.innerHTML = '';
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad;        
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    });
    items.appendChild(fragment);
    pintarFooter();
    pintarPagar();
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

const pintarFooter = () => {
    footer.innerHTML = '';
    if (Object.keys(carrito).length === 0) {
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío</th>`;
        return;
    };
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0);
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);
    const boton = document.querySelector('#vaciar-carrito');
    boton.addEventListener('click', () => {
        carrito = {};
        pintarCarrito();
    });
};

function pintarPagar() {
    let pagar = document.getElementById("pagar")
    pagar.innerHTML = "";
    if (Object.keys(carrito).length > 0) {
        pagar.innerHTML = 
        `<button class="pagar" onclick="pagar()">Pagar</button>`
        return;
    };
}

const btnAumentarDisminuir = e => {
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito[e.target.dataset.id] = { ...producto };
        pintarCarrito();
    };
    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id];
        }
        else {
            carrito[e.target.dataset.id] = {...producto};
        };
        pintarCarrito();
    };
    e.stopPropagation();
};

function pagar(){

    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0);

    let formaPago = parseInt(prompt(`Su monto a pagar es de ${nPrecio}.
    1 para credito:
    2 para debito: `))

    if(formaPago === 1){

        let pago = prompt('Ingresa el numero de tu tarjeta: ');

        let cuotas = parseInt(prompt(`Seleccione las cuotas deseadas
        1 para 3 cuotas con 10% de recargo
        2 para 6 cuotas con 15% de recargo
        3 para 12 cuotas con 20% de recargo`));

        let recargo = 0;

        switch(cuotas) {
            case 1:
                recargo = nPrecio * 0.10;
                valorCuota = (nPrecio + recargo) / 3;

                alert(`Su pago fue aprobado
                Total abonado ${nPrecio + recargo}.
                3 cuotas de ${valorCuota}.`);
                carrito = {};
                pintarCarrito();
                break;
            case 2:
                recargo = nPrecio * 0.15;
                valorCuota = (nPrecio + recargo) / 6;

                alert(`Su pago fue aprobado
                Total abonado ${nPrecio + recargo}.
                6 cuotas de ${valorCuota}.`);
                carrito = {};
                pintarCarrito();
                break;
            case 3:
                recargo = nPrecio * 0.20;
                valorCuota = (nPrecio + recargo) / 12;

                alert(`Su pago fue aprobado
                Total abonado ${nPrecio + recargo}.
                12 cuotas de ${valorCuota}.`);
                carrito = {};
                pintarCarrito();
                break;
        }
    }
    else if(formaPago === 2){

        let pago = prompt('Ingresa el numero de tu tarjeta: ');

        alert(`Tu pago fue aprobado
        Total abonado ${nPrecio}`);
        carrito = {};
        pintarCarrito(); 
    }
    else{
        alert("No se pudo realizar el pago, intente nuevamente.")
    }
}