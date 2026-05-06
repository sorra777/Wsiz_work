class ComplexNumber {
    constructor(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    wypisz() {
        if (this.imaginary < 0) {
            return `${this.real} - ${Math.abs(this.imaginary)}i`;
        } else {
            return `${this.real} + ${this.imaginary}i`;
        }
    }

    module() {
        return Math.sqrt(this.real ** 2 + this.imaginary ** 2);
    }
}

function generujLiczbyZespolone(rozmiar) {
    const tablica = [];
    for(let i = 0; i < rozmiar; i++) {
        let r = Math.floor(Math.random() * 21) - 10; 
        let im = Math.floor(Math.random() * 21) - 10;
        tablica.push(new ComplexNumber(r, im));
    }
    return tablica;
}

const liczby = generujLiczbyZespolone(5);

console.log("--- BAZOWA TABLICA ---");
liczby.forEach(liczba => console.log(`Liczba: ${liczba.wypisz()}, Moduł: ${liczba.module().toFixed(2)}`));

console.log("\n--- ZADANIE 4 (filter: tylko dodatnie r i im) ---");
const tylkoDodatnie = liczby.filter(liczba => liczba.real > 0 && liczba.imaginary > 0);
tylkoDodatnie.forEach(liczba => console.log(liczba.wypisz()));
if (tylkoDodatnie.length === 0) console.log("Brak liczb spełniających warunek.");

console.log("\n--- ZADANIE 5 (map: zamiana rzeczywistej z urojoną) ---");
const zamienione = liczby.map(liczba => new ComplexNumber(liczba.imaginary, liczba.real));
zamienione.forEach(liczba => console.log(liczba.wypisz()));

console.log("\n--- ZADANIE 6 (reduce: suma modułów) ---");
const sumaModulow = liczby.reduce((akumulator, liczba) => akumulator + liczba.module(), 0);
console.log(`Suma modułów: ${sumaModulow.toFixed(2)}`);

console.log("\n--- ZADANIE 7 (reduce: najmniejszy moduł) ---");
const najmniejszyModul = liczby.reduce((min, liczba) => Math.min(min, liczba.module()), Infinity);
console.log(`Najmniejsza wartość modułu to: ${najmniejszyModul.toFixed(2)}`);

console.log("\n--- ZADANIE 8 (reduce: liczba z największym modułem) ---");
const maxObiekt = liczby.reduce((maxObj, obecnaLiczba) => 
    (obecnaLiczba.module() > maxObj.module()) ? obecnaLiczba : maxObj
);
console.log(`Liczba o największym module to: ${maxObiekt.wypisz()} (moduł: ${maxObiekt.module().toFixed(2)})`);