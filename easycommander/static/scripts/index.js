const button = document.getElementById("submit-button")
if(button) {
    button.addEventListener('click', () => {
        const par = document.createElement("p");
        par.textContent = "Buton apasat";
        document.body.append(par)
    });
}