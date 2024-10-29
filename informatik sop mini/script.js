async function hentMetadata() {
    const inputType = document.getElementById("input-type").value;
    const kildeInput = document.getElementById("kilde-input").value;
    const style = document.getElementById("style").value;
    const resultElement = document.getElementById("result");
    const loadingElement = document.getElementById("loading");

    resultElement.innerHTML = '';
    loadingElement.classList.remove('hidden');

    if (!kildeInput) {
        resultElement.innerHTML = "<strong>Indtast venligst en kilde.</strong>";
        loadingElement.classList.add('hidden');
        return;
    }

    try {
        let response, data;

        if (inputType === "doi") {
            // Hent metadata fra CrossRef API for DOI
            response = await fetch(`https://api.crossref.org/works/${kildeInput}`);
            if (!response.ok) {
                throw new Error("Kunne ikke hente metadata fra CrossRef API.");
            }
            data = await response.json();

            const forfattere = data.message.author.map(author => `${author.given} ${author.family}`).join(", ");
            const titel = data.message.title[0];
            const aar = data.message.created['date-parts'][0][0];
            const udgiver = data.message.publisher;

            // Formater kildehenvisning baseret på valg af stil
            formatHenvisning(forfattere, titel, aar, udgiver, style);

        } else if (inputType === "isbn") {
            // Hent metadata fra Google Books API for ISBN
            response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${kildeInput}`);
            if (!response.ok) {
                throw new Error("Kunne ikke hente metadata fra Google Books API.");
            }
            data = await response.json();

            const bookInfo = data.items[0].volumeInfo;
            const forfattere = bookInfo.authors.join(", ");
            const titel = bookInfo.title;
            const aar = bookInfo.publishedDate.split("-")[0];
            const udgiver = bookInfo.publisher;

            formatHenvisning(forfattere, titel, aar, udgiver, style);

        } else {
            resultElement.innerHTML = "<strong>URL-håndtering er ikke implementeret endnu!</strong>";
        }

    } catch (error) {
        resultElement.innerHTML = `<strong>Fejl: ${error.message}</strong>`;
    } finally {
        loadingElement.classList.add('hidden');
    }
}

function formatHenvisning(forfattere, titel, aar, udgiver, style) {
    const resultElement = document.getElementById("result");
    let henvisning = "";

    if (style === "apa") {
        henvisning = `${forfattere} (${aar}). *${titel}*. ${udgiver}.`;
    } else if (style === "mla") {
        henvisning = `${forfattere}. *${titel}*. ${udgiver}, ${aar}.`;
    } else if (style === "chicago") {
        henvisning = `${forfattere}. ${titel}. ${udgiver}, ${aar}.`;
    }

    resultElement.innerHTML = `<strong>Din kildehenvisning i ${style.toUpperCase()}-stil:</strong><br>${henvisning}`;
}
