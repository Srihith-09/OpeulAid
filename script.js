const services = [
  {name: 'Plumbing', img: 'https://via.placeholder.com/250x150?text=Plumbing'},
  {name: 'Cleaning', img: 'https://via.placeholder.com/250x150?text=Cleaning'},
  {name: 'Electrician', img: 'https://via.placeholder.com/250x150?text=Electrician'},
  {name: 'Gardening', img: 'https://via.placeholder.com/250x150?text=Gardening'}
];

const employees = [
  {name: 'Alice', service: 'Plumbing', img: 'https://via.placeholder.com/250x150?text=Alice'},
  {name: 'Bob', service: 'Cleaning', img: 'https://via.placeholder.com/250x150?text=Bob'},
  {name: 'Charlie', service: 'Electrician', img: 'https://via.placeholder.com/250x150?text=Charlie'},
  {name: 'Diana', service: 'Gardening', img: 'https://via.placeholder.com/250x150?text=Diana'}
];

const locationBtn = document.getElementById('locationBtn');
const servicesSection = document.getElementById('servicesSection');
const servicesContainer = document.getElementById('servicesContainer');
const employeesSection = document.getElementById('employeesSection');
const employeesContainer = document.getElementById('employeesContainer');

locationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(() => {
      locationBtn.style.display = 'none';
      showServices();
    }, () => {
      alert('Location permission denied. Showing all services.');
      locationBtn.style.display = 'none';
      showServices();
    });
  } else {
    alert('Geolocation not supported');
    showServices();
  }
});

function showServices() {
  servicesSection.classList.remove('hidden');
  servicesContainer.innerHTML = '';
  services.forEach((service, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `<img src='${service.img}' alt='${service.name}' /><h3>${service.name}</h3><button onclick="showEmployees('${service.name}')">Select</button>`;
    servicesContainer.appendChild(card);
  });
}

function showEmployees(serviceName) {
  employeesSection.classList.remove('hidden');
  employeesContainer.innerHTML = '';
  employees.filter(emp => emp.service === serviceName).forEach((emp, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.animationDelay = `${index * 0.1}s`;
    card.innerHTML = `<img src='${emp.img}' alt='${emp.name}' /><h3>${emp.name}</h3>
                      <button onclick="callEmployee('${emp.name}')">Call</button>
                      <button onclick="textEmployee('${emp.name}')">Text</button>`;
    employeesContainer.appendChild(card);
  });
}

function callEmployee(name) {
  alert(`Calling ${name}...`);
}

function textEmployee(name) {
  alert(`Messaging ${name} via app...`);
}
