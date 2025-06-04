// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const mainContent = document.getElementById('mainContent');
const formularioPaciente = document.getElementById('formularioPaciente');
const tablaPacientes = document.getElementById('tablaPacientes');
const logoutBtn = document.getElementById('logoutBtn');
const showLoginLink = document.getElementById('showLoginLink');
const showRegisterLink = document.getElementById('showRegisterLink');
const sendCodeBtn = document.getElementById('sendCodeBtn');

// Contadores de gravedad
const countLeve = document.getElementById('countLeve');
const countModerado = document.getElementById('countModerado');
const countUrgente = document.getElementById('countUrgente');
const countCritico = document.getElementById('countCritico');

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.addEventListener('click', function() {
    const input = this.previousElementSibling;
    if (input.type === 'password') {
      input.type = 'text';
      this.textContent = '🙈';
    } else {
      input.type = 'password';
      this.textContent = '👁';
    }
  });
});

// Navegación entre formularios
showRegisterLink.addEventListener('click', function(e) {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
});

showLoginLink.addEventListener('click', function(e) {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

// Cerrar sesión (CORRECCIÓN APLICADA)
logoutBtn.addEventListener('click', function() {
  mainContent.classList.add('hidden');
  loginForm.classList.remove('hidden');
  showMessage('loginForm', 'Has cerrado sesión correctamente', 'success');
});

// REGISTRO (simulado con código de verificación)
let verificationSent = false;
let currentVerificationCode = '';

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

sendCodeBtn.addEventListener('click', function() {
  const email = document.getElementById('regEmail').value.trim();
  if (!validateEmail(email)) {
    showMessage('registerForm', 'Correo inválido', 'error');
    return;
  }
  
  currentVerificationCode = generateCode();
  verificationSent = true;
  alert(`Código de verificación enviado: ${currentVerificationCode} (simulado)`);
  document.getElementById('verificationCode').classList.remove('hidden');
  showMessage('registerForm', 'Código enviado, revisa tu correo', 'success');
});

// REGISTRO (CORRECCIÓN APLICADA - guardar email en sessionStorage)
registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (!verificationSent) {
    showMessage('registerForm', 'Primero debes enviar el código', 'error');
    return;
  }
  
  const enteredCode = document.getElementById('verificationCode').value.trim();
  if (enteredCode !== currentVerificationCode) {
    showMessage('registerForm', 'Código incorrecto', 'error');
    return;
  }

  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  
  if (!validateEmail(email)) {
    showMessage('registerForm', 'Correo inválido', 'error');
    return;
  }
  
  if (!validatePassword(password)) {
    showMessage('registerForm', 'La contraseña debe tener mínimo 8 caracteres, incluyendo letras, números y símbolos.', 'error');
    return;
  }

  const user = { email, password };
  localStorage.setItem('user', JSON.stringify(user));
  
  // Guardar el email en sessionStorage para persistencia
  sessionStorage.setItem('userEmail', email);

  showMessage('registerForm', 'Registro exitoso. Ahora puedes iniciar sesión.', 'success');
  setTimeout(() => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  }, 2000);
});

// LOGIN (CORRECCIÓN APLICADA - autorellenar email)
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const storedUser = JSON.parse(localStorage.getItem('user'));

  if (!storedUser || storedUser.email !== email || storedUser.password !== password) {
    showMessage('loginForm', 'Correo o contraseña incorrectos.', 'error');
    return;
  }

  // Guardar email en sessionStorage
  sessionStorage.setItem('userEmail', email);

  showMessage('loginForm', 'Inicio de sesión exitoso. Redirigiendo...', 'success');
  setTimeout(() => {
    loginForm.classList.add('hidden');
    mainContent.classList.remove('hidden');
    updatePacientesTable();
    updateCounters();
  }, 1500);
});

// VALIDACIONES
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
  return re.test(password);
}

function showMessage(formId, msg, type) {
  const form = document.getElementById(formId);
  const message = form.querySelector('.message');
  message.textContent = msg;
  message.className = `message ${type}`;
}

// Funciones para pacientes
function clearValidation() {
  const inputs = formularioPaciente.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.classList.remove('is-invalid');
  });
}

function validatePatientForm() {
  let isValid = true;
  clearValidation();
  
  // Validar campos requeridos
  const requiredFields = ['nombre', 'edad', 'genero', 'documento', 'sintomas', 'gravedad'];
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      field.classList.add('is-invalid');
      isValid = false;
    }
  });
  
  // Validación especial para edad
  const edad = parseInt(document.getElementById('edad').value);
  if (isNaN(edad)) {
    document.getElementById('edad').classList.add('is-invalid');
    isValid = false;
  } else if (edad <= 0) {
    document.getElementById('edad').classList.add('is-invalid');
    isValid = false;
  }
  
  // Validación especial para documento
  const documento = document.getElementById('documento').value.trim();
  if (documento.length < 5) {
    document.getElementById('documento').classList.add('is-invalid');
    isValid = false;
  }
  
  return isValid;
}

// Registrar paciente (MODIFICADO)
formularioPaciente.addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (!validatePatientForm()) {
    return;
  }
  
  const nombre = document.getElementById('nombre').value.trim();
  const edad = parseInt(document.getElementById('edad').value);
  const genero = document.getElementById('genero').value;
  const documento = document.getElementById('documento').value.trim();
  const sintomas = document.getElementById('sintomas').value.trim();
  const gravedad = document.getElementById('gravedad').value;
  const tratamiento = document.getElementById('tratamiento').value.trim();
  const medicamentos = document.getElementById('medicamentos').value.trim();
  
  // Obtener exámenes seleccionados
  const examenesSelect = document.getElementById('examenes');
  const examenes = [];
  for (let i = 0; i < examenesSelect.options.length; i++) {
    if (examenesSelect.options[i].selected) {
      examenes.push(examenesSelect.options[i].text);
    }
  }
  
  const paciente = {
    nombre,
    edad,
    genero,
    documento,
    sintomas,
    gravedad,
    tratamiento,
    medicamentos,
    examenes,
    fecha: new Date().toISOString()
  };
  
  // Guardar en localStorage con clave única por usuario (MODIFICADO)
  const userEmail = sessionStorage.getItem('userEmail');
  const userKey = `pacientes_${userEmail}`;
  let pacientes = JSON.parse(localStorage.getItem(userKey)) || [];
  pacientes.push(paciente);
  localStorage.setItem(userKey, JSON.stringify(pacientes));
  
  // Mostrar alerta si es crítico
  if (gravedad === 'critico') {
    showCriticalAlert();
  }
  
  // Actualizar la tabla
  updatePacientesTable();
  updateCounters();
  
  // Limpiar el formulario
  formularioPaciente.reset();
});

// Actualizar tabla de pacientes (MODIFICADO)
function updatePacientesTable() {
  const userEmail = sessionStorage.getItem('userEmail');
  const userKey = `pacientes_${userEmail}`;
  const pacientes = JSON.parse(localStorage.getItem(userKey)) || [];
  
  // Ordenar por gravedad (crítico > urgente > moderado > leve)
  const ordenGravedad = {
    'critico': 4,
    'urgente': 3,
    'moderado': 2,
    'leve': 1
  };
  
  pacientes.sort((a, b) => {
    return ordenGravedad[b.gravedad] - ordenGravedad[a.gravedad];
  });
  
  // Limpiar tabla
  tablaPacientes.innerHTML = '';
  
  // Agregar pacientes
  pacientes.forEach((paciente, index) => {
    const fila = document.createElement('tr');
    
    // Asignar clase según gravedad
    switch (paciente.gravedad) {
      case 'leve':
        fila.className = 'triaje-leve';
        break;
      case 'moderado':
        fila.className = 'triaje-moderado';
        break;
      case 'urgente':
        fila.className = 'triaje-urgente';
        break;
      case 'critico':
        fila.className = 'triaje-critico';
        break;
    }
    
    fila.innerHTML = `
      <td>${paciente.nombre}</td>
      <td>${paciente.edad}</td>
      <td>${paciente.genero}</td>
      <td>${paciente.documento}</td>
      <td>${paciente.sintomas}</td>
      <td>${getGravedadText(paciente.gravedad)}</td>
      <td>${paciente.tratamiento || '-'}</td>
      <td>${paciente.medicamentos || '-'}</td>
      <td>${paciente.examenes.join(', ') || '-'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="eliminarPaciente(${index})">Eliminar</button></td>
    `;
    
    tablaPacientes.appendChild(fila);
  });
}

function getGravedadText(gravedad) {
  switch (gravedad) {
    case 'leve': return '🟩 Leve';
    case 'moderado': return '🟨 Moderado';
    case 'urgente': return '🟧 Urgente';
    case 'critico': return '🟥 Crítico';
    default: return gravedad;
  }
}

// Actualizar contadores (MODIFICADO)
function updateCounters() {
  const userEmail = sessionStorage.getItem('userEmail');
  const userKey = `pacientes_${userEmail}`;
  const pacientes = JSON.parse(localStorage.getItem(userKey)) || [];
  
  const counts = {
    leve: 0,
    moderado: 0,
    urgente: 0,
    critico: 0
  };
  
  pacientes.forEach(paciente => {
    counts[paciente.gravedad]++;
  });
  
  countLeve.textContent = counts.leve;
  countModerado.textContent = counts.moderado;
  countUrgente.textContent = counts.urgente;
  countCritico.textContent = counts.critico;
}

// Eliminar paciente (MODIFICADO)
window.eliminarPaciente = function(index) {
  const userEmail = sessionStorage.getItem('userEmail');
  const userKey = `pacientes_${userEmail}`;
  let pacientes = JSON.parse(localStorage.getItem(userKey)) || [];
  pacientes.splice(index, 1);
  localStorage.setItem(userKey, JSON.stringify(pacientes));
  updatePacientesTable();
  updateCounters();
}

// Mostrar alerta para pacientes críticos
function showCriticalAlert() {
  const alertDiv = document.createElement('div');
  alertDiv.className = 'alert-critical';
  alertDiv.innerHTML = `
    <h4>🚨 ¡Paciente Crítico!</h4>
    <p>Se ha registrado un paciente en estado crítico que requiere atención inmediata.</p>
  `;
  
  document.body.appendChild(alertDiv);
  
  // Eliminar después de la animación
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.parentNode.removeChild(alertDiv);
    }
  }, 3500);
}

// Inicializar - CORRECCIÓN APLICADA (autorellenar email)
document.addEventListener('DOMContentLoaded', function() {
  // Autorellenar email si existe en sessionStorage
  const savedEmail = sessionStorage.getItem('userEmail');
  if (savedEmail) {
    document.getElementById('loginEmail').value = savedEmail;
  }

  // Asegurar que solo se muestre el login al inicio
  loginForm.classList.remove('hidden');
  mainContent.classList.add('hidden');
  registerForm.classList.add('hidden');
  
  // Validación en tiempo real para formulario de pacientes
  const inputs = formularioPaciente.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('input', function() {
      if (this.classList.contains('is-invalid')) {
        this.classList.remove('is-invalid');
      }
    });
  });
  
  // Validación especial para edad
  document.getElementById('edad').addEventListener('input', function() {
    if (this.value < 1) {
      this.value = '';
    }
  });
  
  // Validación especial para documento
  document.getElementById('documento').addEventListener('input', function() {
    if (this.value.length < 5 && this.value.length > 0) {
      this.classList.add('is-invalid');
    } else if (this.classList.contains('is-invalid')) {
      this.classList.remove('is-invalid');
    }
  });
});