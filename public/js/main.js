let sessionData
let btnLoginElement
let userDisplayElement
let gestorDeCursos

class Curso {
    constructor(id, autor, nombreCurso, terminado) {
        this._id = id;
        this._autor = autor;
        this._nombreCurso = nombreCurso;
        this._onBtnLoginClick = terminado ?? false;
    }

    // Getters
    get id() {
        return this._id;
    }

    get autor() {
        return this._autor;
    }

    get nombreCurso() {
        return this._nombreCurso;
    }

    get terminado() {
        return this._terminado;
    }

    // Setters
    setAutor(nuevoAutor) {
        this._autor = nuevoAutor;
    }

    setNombreCurso(nuevoNombre) {
        this._nombreCurso = nuevoNombre;
    }

    // Método para alternar estado de terminado
    toggleTerminado() {
        this._terminado = !this._terminado;
    }
}

class GestorDeCursos {
    constructor(cursos) {
        this.cursos = cursos.map(curso => (new Curso(
            curso.id, 
            curso.autor, 
            curso.nombreCurso,
            curso.terminado
        ))) ?? [];
        this.renderListaCursos()
    }

    setCursosToLocalStorage() {
        const cursosLimpios = this.cursos.map(curso => ({
            id: curso.id,
            autor: curso.autor,
            nombreCurso: curso.nombreCurso,
            terminado: curso.terminado
        }));
        localStorage.setItem('cursos', JSON.stringify(cursosLimpios))
    }
  
    agregarCurso(autor, nombreCurso) {
        const id = this.cursos.length
            ? this.cursos[this.cursos.length - 1].id + 1
            : this.cursos.length + 1
        const curso = new Curso(id, autor, nombreCurso)
        this.cursos.push(curso)
        this.setCursosToLocalStorage()
        this.renderListaCursos()
    }
  
    eliminarCurso(id) {
        this.cursos = this.cursos.filter(curso => curso.id !== id)
        this.setCursosToLocalStorage()
        this.renderListaCursos()
    }

    actualizarCurso({id, autor, nombreCurso}) {
        const curso = this.cursos.find(curso => curso.id === id);
    
        if (!curso) {
            console.error(`Curso con ID ${id} no encontrado`);
            return;
        }
    
       
        if (autor) curso.setAutor(autor);
        if (nombreCurso) curso.setNombreCurso(nombreCurso);
        this.setCursosToLocalStorage();
        this.renderListaCursos();
        alert("Curso actualizado correctamente");
    }

    onEstadoChange(id) {
        const curso = this.cursos.find(curso => curso.id === id);
        if (curso) {
            curso.toggleTerminado();
            this.setCursosToLocalStorage()
            this.renderListaCursos()
        } else {
            console.error(`Curso con ID ${id} no encontrado`);
        }
    }
  
    renderListaCursos() {
        this.clearContainer('listaCursos')
        const listaCursos = document.getElementById('listaCursos')
        this.cursos.forEach((curso, index) => {
            const card = document.createElement("div");
            card.classList.add('lista-cursos-card')
            card.innerHTML = `
                <div class="d-flex mb-1">
                    <p class="lista-cursos-card__label quantico-font text-uppercase me-1">ID:</p>
                    <P class="lista-cursos-card__id quantico-font text-uppercase">#${curso.id}</P>
                </div>

                <div class="d-flex mb-1">
                    <p class="lista-cursos-card__label me-1 quantico-font text-uppercase">Autor:</p>
                    <P class="lista-cursos-card__id quantico-font text-uppercase">${curso.autor}</P>
                </div>

                <div class="w-100 d-flex justify-content-between mb-1">
                    <div class="w-100">
                        <p class="lista-cursos-card__label">Nombre del curso:</p>
                        <h3 class="fs-3 wrap-break-word ">${curso.nombreCurso}</p>
                    </div>
                </div>

                <div class="w-100 mb-3">
                    <p class="lista-cursos-card__label">Estado:</p>
                    <select 
                        name="estado-${curso.id}" 
                        id="estado-${curso.id}" 
                        class="btn btn-secondary bg-strong-blue w-100"
                    >
                            <option value="false" ${curso.terminado ? "" : "selected"}>En curso</option>
                            <option value="true" ${curso.terminado ? "selected" : ""}>Terminado</option>
                    </select>
                </div>

                <div class="w-100 d-flex">
                    <button id="editar-${curso.id}"  class="btn btn-secondary w-100 me-2 d-flex align-items-center justify-content-center">
                        <i class="fa-solid fa-pencil me-1 fs-1"></i>
                        <span>Editar</span>
                    </button>
                    <button id="eliminar-${curso.id}"  class="btn btn-danger w-100 d-flex align-items-center justify-content-center">
                        <i class="fa-solid fa-x me-1 fs-1"></i>
                        <span>Eliminar</span>
                    </button>
                </div>
            `;
            
            listaCursos.appendChild(card);

            document.getElementById(`estado-${curso.id}`).addEventListener('change', () => {
                this.onEstadoChange(curso.id)
            })
            document.getElementById(`editar-${curso.id}`).addEventListener('click', () => {
                onClickEditarCurso({
                    id: curso.id,
                    autor: curso.autor,
                    nombreCurso: curso.nombreCurso
                })
            })
            document.getElementById(`eliminar-${curso.id}`).addEventListener('click', () => {
                this.eliminarCurso(curso.id)
            })
        });
    }
  
    clearContainer(id) {
        document.getElementById(id).innerHTML = ''
    }
}
function handleEditClick(event) {
    event.preventDefault(); 

    const id = document.getElementById('curso-id').value;
    const autor = document.getElementById('owner-name').value;
    const nombreCurso = document.getElementById('curso-name').value;

    if (!autor || !nombreCurso) {
        alert('Los campos "Autor" y "Nombre del curso" no pueden estar vacíos');
        return;
    }

    gestorDeCursos.actualizarCurso({
        id: Number(id),
        autor,
        nombreCurso
    });

    closeModal();
}


function setUserDisplayElement() {
    userDisplayElement = document.getElementById('usernameDisplay')
    if(!userDisplayElement) return
    const { username } = sessionData
    userDisplayElement.innerHTML = username
}

function onCursosInit() {
    const cursosBody = document.getElementById('cursosBody')
    if(!cursosBody) return;
    if(!sessionData) {
        redirect(`${window.location.origin}`)
    }
    setUserDisplayElement();
    const cursos = JSON.parse(localStorage.getItem('cursos')) || [];
    gestorDeCursos = new GestorDeCursos(cursos);
}

function setBtnLoginValue(htmlElement) {
    if(!sessionData) return
    if(!htmlElement) return
    const { username, email } = sessionData
    if(username && email) htmlElement.innerHTML = 'VER CURSOS';
}

// Obtiene la información de la sesión activa del localStorage
function setSessionData(sessionValues) {
    if(sessionValues) localStorage.setItem('session', JSON.stringify(sessionValues));
    sessionData = JSON.parse(localStorage.getItem('session'))
}

// open modal by id
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.classList.add('jw-modal-open');
}

// close currently open modal
function closeModal(event) {
    document.querySelector('.jw-modal.open').classList.remove('open');
    document.body.classList.remove('jw-modal-open');
}

function onLoginSubmit(event) {
    event.preventDefault()
    const formValues = Object.values(event.target).reduce((obj,field) => { obj[field.name] = field.value; return obj }, {})

    if(Object.values(formValues).some(el => !el)) return

    setSessionData({
        username: formValues["login-username"],
        email: formValues["login-email"]
    })

    event.target.reset()
    setBtnLoginValue(btnLoginElement)

    redirect(`${window.location.origin}/cursos.html`)
    closeModal()
}

function onAgregarCursoSubmit(event) {
    event.preventDefault();
    const formValues = Object.values(event.target).reduce((obj,field) => { obj[field.name] = field.value; return obj }, {})

    if(Object.values({
        autor: formValues["owner-name"],
        nombreCurso: formValues["curso-name"],
    }).some(el => !el)) return

    event.target.reset()

    if(formValues['curso-id']) {
        gestorDeCursos.actualizarCurso({
            id: Number(formValues['curso-id']),
            autor: formValues["owner-name"],
            nombreCurso: formValues["curso-name"],
        })
    }

    if(!formValues['curso-id']) {
        gestorDeCursos.agregarCurso(formValues["owner-name"], formValues["curso-name"])
    }
    closeModal()
}

function onBtnLoginClick() {
    if(sessionData) {
        redirect(`${window.location.origin}/pages/cursos.html`)
        return
        
    }

    openModal('loginModal');
}

function redirectToLogin() {
    window.location.href = "login.html"; 
}


function onClickEditarCurso({ id, autor, nombreCurso}) {
    openModal('agregarCursoModal');

    document.getElementById('agregarCursoModalTitle').innerHTML = 'Actualiza el curso'
    document.getElementById('curso-id').value = id
    document.getElementById('owner-name').value = autor
    document.getElementById('curso-name').value = nombreCurso
    document.getElementById('agregarCursoSubmitBtn').value = 'Actualizar curso'
    document.getElementById('agregarCursoSubmitBtn').addEventListener('click', handleEditClick);
}

function onClickAgregarCurso() {
    openModal('agregarCursoModal')

    document.getElementById('agregarCursoModalTitle').innerHTML = 'Agrega un curso'
    document.getElementById('curso-id').value = null
    document.getElementById('owner-name').value = ''
    document.getElementById('curso-name').value = ''
    document.getElementById('agregarCursoSubmitBtn').value =  'Agregar curso'
}

function redirect(url) {
    window.location.href = url
}

function preventDefault(event) {
    event.preventDefault()
    return false
}

document.addEventListener('DOMContentLoaded', () => {
    btnLoginElement = document.getElementById('btnLogin')

    setSessionData(sessionData);
    setBtnLoginValue(btnLoginElement);
    onCursosInit()

    window.addEventListener('load', function() {
        // close modals on background click
        document.addEventListener('click', event => {
            if (event.target.classList.contains('jw-modal')) {
                closeModal();
            }
        });
    });
});


