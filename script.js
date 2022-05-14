const cardsEl = document.getElementById("cards");
const loadingEl = document.getElementById("loading");
const nextEl = document.getElementById("next");
const backEl = document.getElementById("back");

const ITEMS_PER_PAGE = 50;
const MAX_NUMBER_OF_POKEMON = 898;
const MAX_PAGES = ~~(MAX_NUMBER_OF_POKEMON / ITEMS_PER_PAGE);

let pages = [];
let pokemon = [];
let currentPage = 0;
let isLoading = true;

backEl.addEventListener("click", () => changePage(0));
nextEl.addEventListener("click", () => changePage(1));
createCards();

async function createCards() {
  isLoading = true;
  loadingEl.style.display = "flex";
  cardsEl.style.display = "none";

  if (!pages[currentPage]) {
    for (let i = 1; i <= ITEMS_PER_PAGE; i++) {
      await getPokemon(i);
    }
  }

  isLoading = false;
  if (!isLoading) {
    if (pokemon[0]) {
      pages.push(pokemon);
      pokemon = [];
    } else {
      pages[currentPage]?.forEach((pokemon) => cardsEl.append(pokemon));
    }

    loadingEl.style.display = "none";
    cardsEl.style.display = "flex";
  }
}

async function getPokemon(index) {
  try {
    let response, data;

    // If no page found, fetch pokemon then cache it.
    if (!pages[currentPage]) {
      idToFetch = index + ITEMS_PER_PAGE * currentPage;
      if (idToFetch > MAX_NUMBER_OF_POKEMON) return;

      response = await fetch(`https://pokeapi.co/api/v2/pokemon/${idToFetch}`);
      data = await response?.json();
      if (data) {
        const { id, name, sprites, types } = data;

        createCard({
          id,
          name,
          sprite: sprites?.front_default,
          types: types.map(({ type }) => type.name),
        });
      }
      return;
    }
  } catch (err) {
    console.error(err);
  }
}

function createCard({ id, name, sprite, types }) {
  const card = document.createElement("div");
  card.classList.add("card");

  const imgDiv = document.createElement("div");
  imgDiv.classList.add("img");
  imgDiv.setAttribute("data-id", id.toString().padStart(3, "0"));

  const pokemonSprite = document.createElement("img");
  pokemonSprite.src = sprite;
  pokemonSprite.alt = name;
  imgDiv.appendChild(pokemonSprite);
  card.appendChild(imgDiv);

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("info");

  const pokemonName = document.createElement("p");
  pokemonName.classList.add("name");
  pokemonName.innerText = name;

  infoDiv.appendChild(pokemonName);
  card.appendChild(infoDiv);

  const pokemonTypes = document.createElement("div");

  types.forEach((type, i) => {
    const pokemonType = document.createElement("p");
    pokemonType.classList.add("type");
    pokemonType.classList.add(`${type}`);
    pokemonType.innerText = type;

    pokemonTypes.appendChild(pokemonType);
  });

  infoDiv.appendChild(pokemonTypes);
  card.appendChild(infoDiv);
  pokemon.push(card);
  cardsEl.append(card);
}

async function changePage(i) {
  if (isLoading) return;

  // Current # of pokemon 898. 898 / itemsPerPage (50) = 17.9;
  if ((currentPage == 0 && i == 0) || (currentPage == MAX_PAGES && i == 1))
    return;

  if (i == 0) {
    currentPage -= currentPage == 0 ? 0 : 1;
  } else {
    currentPage += currentPage == MAX_PAGES ? 0 : 1;
  }

  const allCards = document.querySelectorAll(".card");
  allCards.forEach((card) => cardsEl.removeChild(card));

  switch (currentPage) {
    default:
      backEl.removeAttribute("disabled");
      nextEl.removeAttribute("disabled");
      break;
    case 0:
      backEl.setAttribute("disabled", true);
      break;
    case MAX_PAGES:
      nextEl.setAttribute("disabled", true);
  }

  await createCards();
}
