/*-------------------------------------\
|  IMPORTACION DE LA BASE DE FIREBASE  |
\-------------------------------------*/
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDoc, doc, updateDoc, deleteDoc, addDoc, getDocs, getCountFromServer } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB9YpoQcEG4wetNUnsvbJlELFTixNqJhBk",
    authDomain: "post-its-3871e.firebaseapp.com",
    projectId: "post-its-3871e",
    storageBucket: "post-its-3871e.firebasestorage.app",
    messagingSenderId: "359329129465",
    appId: "1:359329129465:web:14553eec4cb3bfb5565328"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



let cantElementos = await getCountFromServer(collection(db,"Notas"));
var cantidadNotas = cantElementos.data().count;
document.getElementById("numNotas").innerHTML += cantidadNotas;

document.getElementById("btnCrear").addEventListener("click",agregarNota);
document.getElementById("btnConfirmacion").addEventListener("click",crearNota);
document.getElementById("btnEditar").addEventListener("click",()=>editar());
document.getElementById("btnCancelar").addEventListener("click",cerrarForm);

cargarNotas(true);

/*----------------------------------------\
|  CREACION DE METODOS Y FUNCIONALIDADES  |
\----------------------------------------*/
async function agregarNota(){
    //Se abre una ventana para rellenar los datos de la nota a crear
    document.getElementById("cuadroCrear").style.display = "block";  
}


// Funcion para cerrar la ventans ventanas de formulario
function cerrarForm(e){
    e.target.parentElement.style.display = "none";
}


async function crearNota(e){
    let texto = document.getElementById("notaTexto").value;
    let color = document.getElementById("notaColor").value;

    // Se crea la nota en la base de datos
    let nuevaNota = {
        Id: cantidadNotas,
        Texto: texto,
        Color: color,
        CoordenadaX: 0,
        CoordenadaY: 0,
        fechaCreacion: new Date()
    }  
    await addDoc(collection(db,"Notas"),nuevaNota);
    
    // Se crea la nota en la pagina web
    document.getElementById("cuerpo").innerHTML += `<div class='notas' style='backgroundColor: ${color}; left:0px; top:0px;'>${texto}</div>`;

    //Luego de crear la nota, se cierra la ventana del formulario
    e.target.parentElement.style.display = "none";
}


// Funcion para mostrar las notas en pantalla
async function cargarNotas(primeraCarga){
    const misNotas = await getDocs(collection(db,"Notas"));
    let listaNotas = misNotas.docs;
    let pagina = document.getElementById("cuerpo");
    
    if(!primeraCarga)
        pagina.innerHTML = "";

    for(let doc of listaNotas){
        let nota = doc.data();
        //Crear nota y se la agrego al final del main
        let divNota = document.createElement("div");
        divNota.className = "notas";
        divNota.id = `Nota${nota.Id}`;
        divNota.dataset.id = doc.id; // <--- Id del documento en Firestore (Necesario para editarlo)
        divNota.style.backgroundColor = nota.Color;
        divNota.style.left = `${nota.CoordenadaX}px`;
        divNota.style.top = `${nota.CoordenadaY}px`;
        divNota.textContent = nota.Texto;
        pagina.appendChild(divNota);

        //Le doy las funcionalidades de toques a la nota
        activarInteraccionNota(divNota, doc.id);
    }
}

var idActualizar;
async function editar(e){
    //Recibe los datos de la ventana con los inputs
    let notaNueva = {
        Texto: document.getElementById("editTexto").value,
        Color: document.getElementById("editColor").value,
    };

    await updateDoc(doc(db,"Notas",idActualizar),notaNueva);

    //Luego de actualizarse se cierra la ventana
    e.target.parentElement.style.display = "none";

    cargarNotas(false);
}


async function borrar(id, nota){
    //Borra el documento de la base de datos
    await deleteDoc(doc,(db,"Notas",id));
    //Borra el elemento de la pagina
    nota.remove();

    cargarLibros(false);
}

/*--------------------------------------\
|  CONTROL DEL MOVIMIENTO DE LAS NOTAS  |
\--------------------------------------*/
//let numNotas = parseInt(document.getElementById("numNotas").innerHTML);
//for(let i=1;i<=numNotas;i++){
function activarInteraccionNota(nota, docId){
    let offsetX, offsetY;
    let inicioX, finX, diferenciaX;

    //Control del movimiento y swipe para borrar
    nota.addEventListener("touchstart",(e)=>{
        e.preventDefault();

        offsetX = e.touches[0].clientX - nota.offsetLeft;
        offsetY = e.touches[0].clientY - nota.offsetTop;
        inicioX = e.touches[0].clientX;
    });

    nota.addEventListener("touchmove",(e)=>{
        let toque = e.touches[0];
        nota.style.left = `${toque.clientX-offsetX}px`;
        nota.style.top = `${toque.clientY-offsetY}px`;
    });
/*
    nota.addEventListener("touchend", (e) =>{
        finX = e.changedTouches[0].clientX;
        diferenciaX = finX - inicioX;
        if(diferenciaX > 50)
            borrar(docId,nota);
    })
*/
    //Control del doble clic para editar
    nota.addEventListener("dblclick", (e) =>{
        idActualizar = docId;

        document.getElementById("cuadroEditar").style.display = "block";
    })

}

// Boton para crear notas
let btnCrear = document.getElementById("btnCrear");

let offsetX, offsetY;

btnCrear.addEventListener("touchstart",(e)=>{
    e.preventDefault();

    offsetX = e.touches[0].clientX - btnCrear.offsetLeft;
    offsetY = e.touches[0].clientY - btnCrear.offsetTop;
});

btnCrear.addEventListener("touchmove",(e)=>{
    let toque = e.touches[0];
    btnCrear.style.left = `${toque.clientX-offsetX}px`;
    btnCrear.style.top = `${toque.clientY-offsetY}px`;
});