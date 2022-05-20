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
    localStorage.getItem('carrito') && [carrito = JSON.parse(localStorage.getItem('carrito'))];
    pintarCarrito();
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

const addCarrito = e => {
    e.target.classList.contains('btn') && setCarrito(e.target.parentElement);
    e.stopPropagation();
};

const setCarrito = objeto =>{
    const producto = {
        id: objeto.querySelector('.btn').dataset.id,
        title: objeto.querySelector('h5').textContent,
        precio: objeto.querySelector('p').textContent,
        cantidad: 1
    };
    carrito.hasOwnProperty(producto.id) && [producto.cantidad = carrito[producto.id].cantidad + 1];
    carrito[producto.id] = {...producto};
    let cuadroPagar = document.getElementById("metodo-pago");
    cuadroPagar.innerHTML = "";
    pintarCarrito();
};

const btnAumentarDisminuir = e => {
    const producto = carrito[e.target.dataset.id];
    e.target.classList.contains('btn-info') && [producto.cantidad++,
    carrito[e.target.dataset.id] = { ...producto },
    pintarCarrito()];
    e.target.classList.contains('btn-danger') && [producto.cantidad--,
    producto.cantidad === 0 ? delete carrito[e.target.dataset.id] : carrito[e.target.dataset.id] = {...producto},
    pintarCarrito()];
    let cuadroPagar = document.getElementById("metodo-pago");
    cuadroPagar.innerHTML = "";
    e.stopPropagation();
};

const pintarFooter = () => {
    footer.innerHTML = '';
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0);
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0);
    templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
    templateFooter.querySelector('span').textContent = nPrecio;
    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);
    const boton = document.querySelector('#vaciar-carrito');
    boton.addEventListener('click', () => {
        Swal.fire({
            title: 'Esta seguro?',
            text: "No puede revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            background: '#000000d2',
            color: '#fff',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Si, borrar todo'
          }).then((result) => {
            if (result.isConfirmed) {
              Swal.fire({
                background: '#000000d2',
                color: '#fff',
                title: 'Borrado!',
                text: 'Sus productos han sido borrados',
                icon: 'success'
              })
            carrito = {};
            pintarCarrito();
            };
          });
    });
    Object.keys(carrito).length === 0 && [footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío</th>`];
    return;
};

function pintarPagar() {
    let pagarBtn = document.getElementById("pago");
    pagarBtn.innerHTML = "";
    Object.keys(carrito).length > 0 && [pagarBtn.innerHTML = `<div class="cuadropagar"><button class="pagar" onclick="pagar()">Pagar</button></div>`];
    return;
};

function pagar() {
    let pagarBtn = document.getElementById("pago");
    pagarBtn.innerHTML = "";
    let cuadroPagar = document.getElementById("metodo-pago");
    cuadroPagar.innerHTML = "";
    Object.keys(carrito).length > 0 && [cuadroPagar.innerHTML = 
    `<div class="cuadropago">
        <button class="tarjeta" onclick="debito()">Débito</button>
        <button class="tarjeta" onclick="credito()">Crédito</button>
    </div>
    `];
};

function debito() {
    let cuadroPagar = document.getElementById("metodo-pago");
    cuadroPagar.innerHTML =
    `<div class="pagodebito">
        <input type="text" placeholder="Nombre">
        <input type="text" placeholder="Apellido">
        <input type="email" placeholder="Email">
        <input type="number" placeholder="Numero de tarjeta">
        <button class="debitoP" onclick="alertdebito()">Pagar</button>
    </div>`;
};

function alertdebito() {
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0);
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: `Tu pago fue aprobado, total abonado $${nPrecio}`,
        showConfirmButton: true,
        background: '#000000d2',
        color: '#fff',
    });
    carrito = {};
    pintarCarrito();
    pagar();
};

function credito() {
    let cuadroPagar = document.getElementById("metodo-pago");
    cuadroPagar.innerHTML =
    `<div class="pagocredito">
        <input type="text" placeholder="Nombre">
        <input type="text" placeholder="Apellido">
        <input type="email" placeholder="Email">
        <input class="numerot" type="number" placeholder="Numero de tarjeta">
        <div class="form-group">
            <select id="cuotas" class="form-control selector">
                <option value="0">Selecione las cuotas</option>
                <option value="1">3 cuotas con el 10% de Recargo</option>
                <option value="2">6 cuotas con el 15% de Recargo</option>
                <option value="3">12 cuotas con el 20% de Recargo</option>
            </select>
        </div>
        <button class="creditoP" onclick="alertcredito()">Pagar</button>
    </div>`;
};

function alertcredito() {
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0);
    let cuotas = Number(document.getElementById("cuotas").value);
    if (cuotas === 1){
        recargo = nPrecio * 0.10;
        valorCuota = (nPrecio + recargo) / 3;
        valorCuota = valorCuota.toFixed(2);
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: `Su pago fue aprobado, total abonado $${nPrecio + recargo}.
            Realizado en 3 cuotas de $${valorCuota}`,
            showConfirmButton: true,
            background: '#000000d2',
            color: '#fff',
        });
        carrito = {};
        pintarCarrito();
        pagar();
    }
    else if(cuotas === 2){
        recargo = nPrecio * 0.15;
        valorCuota = (nPrecio + recargo) / 6;
        valorCuota = valorCuota.toFixed(2);
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: `Su pago fue aprobado, total abonado $${nPrecio + recargo}.
            Realizado en 6 cuotas de $${valorCuota}`,
            showConfirmButton: true,
            background: '#000000d2',
            color: '#fff',
        });
        carrito = {};
        pintarCarrito();
        pagar();
    }
    else if (cuotas === 3){
        recargo = nPrecio * 0.20;
        valorCuota = (nPrecio + recargo) / 12;
        valorCuota = valorCuota.toFixed(2);
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: `Su pago fue aprobado, total abonado $${nPrecio + recargo}. 
            Realizado en 12 cuotas de $${valorCuota}`,
            showConfirmButton: true,
            background: '#000000d2',
            color: '#fff',
        });
        carrito = {};
        pintarCarrito();
        pagar();
    }
    else{
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: `Selecione las cuotas para poder realizar el pago`,
            showConfirmButton: true,
            background: '#000000d2',
            color: '#fff',
        });
        pagar();
    };
};