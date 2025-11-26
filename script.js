function showHire() {
    document.getElementById("home-page").classList.add("hidden");
    document.getElementById("hire-page").classList.remove("hidden");
    document.getElementById("service-detail").classList.add("hidden");
    document.getElementById("chat-page").classList.add("hidden");
}

function goHome() {
    document.getElementById("home-page").classList.remove("hidden");
    document.getElementById("hire-page").classList.add("hidden");
    document.getElementById("service-detail").classList.add("hidden");
    document.getElementById("chat-page").classList.add("hidden");
}

let currentService = "";

function openService(name) {
    currentService = name;
    document.getElementById("service-title").innerText =
        name.charAt(0).toUpperCase() + name.slice(1) + " Service";

    document.getElementById("hire-page").classList.add("hidden");
    document.getElementById("service-detail").classList.remove("hidden");
}

function callPerson() {
    alert("Call this number: +91 9876543210");
}

function openChat() {
    document.getElementById("service-detail").classList.add("hidden");
    document.getElementById("chat-page").classList.remove("hidden");
}

function sendMessage() {
    let input = document.getElementById("chat-input");
    let chatBox = document.getElementById("chat-box");

    if (input.value.trim() === "") return;

    chatBox.innerHTML += `<div>You: ${input.value}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}

