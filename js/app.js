const state = {
  places: [],
  filtered: [],
  activeType: 'all',
  activeSort: 'az',
  query: ''
};

const statusEl = document.querySelector('#status');
const cardsEl = document.querySelector('#cards');
const searchEl = document.querySelector('#search-input');
const sortEl = document.querySelector('#sort-select');
const typeEl = document.querySelector('#type-filter');
const imageFilterEl = document.querySelector('#image-place-filter');
const imageListEl = document.querySelector('#image-library-list');
const modal = document.querySelector('#place-modal');
const modalClose = document.querySelector('#modal-close');
let modalLastFocus = null;

const requiredFields = ['id', 'name', 'summary', 'tags', 'type', 'rating'];

function safePlace(place) {
  const fallback = {
    id: crypto.randomUUID(),
    name: 'Unknown place',
    summary: 'Summary unavailable.',
    tags: [],
    type: 'Other',
    rating: 0,
    coordinates: null,
    images: []
  };

  for (const key of requiredFields) {
    if (!(key in place)) {
      return { ...fallback, ...place };
    }
  }

  return {
    ...fallback,
    ...place,
    tags: Array.isArray(place.tags) ? place.tags : [String(place.tags)],
    images: Array.isArray(place.images) ? place.images : []
  };
}

async function loadData() {
  statusEl.textContent = 'Loading places…';

  try {
    const response = await fetch('./data/data.json');
    if (!response.ok) {
      throw new Error(`Unable to load data: ${response.status}`);
    }

    const raw = await response.json();
    const places = Array.isArray(raw.places) ? raw.places : [];
    state.places = places.map(safePlace);
    fillTypeFilter();
    fillImageFilter();
    applyFilters();
    statusEl.textContent = `${state.filtered.length} places found.`;
  } catch (error) {
    statusEl.textContent = 'Could not load place data. Please refresh or check data.json.';
    cardsEl.innerHTML = '';
    console.error(error);
  }
}

function fillTypeFilter() {
  const types = [...new Set(state.places.map((p) => p.type).filter(Boolean))].sort();
  for (const type of types) {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeEl.append(option);
  }
}

function fillImageFilter() {
  for (const place of state.places) {
    const option = document.createElement('option');
    option.value = place.id;
    option.textContent = place.name;
    imageFilterEl.append(option);
  }
}

function applyFilters() {
  const q = state.query.toLowerCase().trim();

  const filtered = state.places.filter((place) => {
    const textBlob = `${place.name} ${place.summary} ${place.tags.join(' ')}`.toLowerCase();
    const textMatch = textBlob.includes(q);
    const typeMatch = state.activeType === 'all' || place.type === state.activeType;
    return textMatch && typeMatch;
  });

  filtered.sort((a, b) => {
    if (state.activeSort === 'rating') {
      return b.rating - a.rating;
    }
    if (state.activeSort === 'type') {
      return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  state.filtered = filtered;
  renderCards();
  renderImageLibrary();
  statusEl.textContent = `${filtered.length} places found.`;
}

function renderCards() {
  cardsEl.innerHTML = '';

  if (!state.filtered.length) {
    cardsEl.innerHTML = '<p>No places matched your filters.</p>';
    return;
  }

  for (const place of state.filtered) {
    const button = document.createElement('button');
    button.className = 'card';
    button.type = 'button';
    button.innerHTML = `
      <h3>${place.name}</h3>
      <p class="meta">Type: ${place.type} · Rating: ${Number(place.rating).toFixed(1)}</p>
      <p>${place.summary}</p>
      <div class="tags">${place.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
    `;

    button.addEventListener('click', () => openModal(place, button));
    cardsEl.append(button);
  }
}

function mapsUrl(place) {
  if (place.coordinates?.lat && place.coordinates?.lng) {
    return `https://www.google.com/maps?q=${place.coordinates.lat},${place.coordinates.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
}

function openModal(place, triggerEl) {
  modalLastFocus = triggerEl;
  modal.querySelector('#modal-title').textContent = place.name;
  modal.querySelector('#modal-summary').textContent = place.summary;
  modal.querySelector('#modal-rating').textContent = `Rating: ${Number(place.rating).toFixed(1)} / 5`;
  modal.querySelector('#modal-tags').innerHTML = place.tags.map((tag) => `<li>${tag}</li>`).join('');
  modal.querySelector('#modal-map-link').href = mapsUrl(place);
  modal.showModal();
  activateFocusTrap(modal);
}

function closeModal() {
  modal.close();
  removeFocusTrap();
  modalLastFocus?.focus();
}

function activateFocusTrap(container) {
  const selector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = [...container.querySelectorAll(selector)].filter((el) => !el.disabled);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function trapTab(event) {
    if (event.key !== 'Tab') {
      return;
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.__trapHandler = trapTab;
  container.addEventListener('keydown', trapTab);
  first?.focus();
}

function removeFocusTrap() {
  if (modal.__trapHandler) {
    modal.removeEventListener('keydown', modal.__trapHandler);
    delete modal.__trapHandler;
  }
}

function renderImageLibrary() {
  const selectedPlace = imageFilterEl.value;
  const places = selectedPlace === 'all' ? state.filtered : state.places.filter((place) => place.id === selectedPlace);
  const images = places.flatMap((place) =>
    place.images.map((image) => ({
      placeName: place.name,
      ...image
    }))
  );

  imageListEl.innerHTML = '';

  if (!images.length) {
    imageListEl.innerHTML = '<p>No images available for the selected place.</p>';
    return;
  }

  for (const image of images) {
    const card = document.createElement('article');
    card.className = 'image-card';
    card.innerHTML = `
      <h3>${image.title || 'Untitled image'}</h3>
      <p><strong>Place:</strong> ${image.placeName}</p>
      <p><strong>License:</strong> ${image.license || 'Not specified'}</p>
      <p><strong>Attribution:</strong> ${image.attribution || 'Not specified'}</p>
      <p><a href="${image.source || '#'}" target="_blank" rel="noopener noreferrer">Source link</a></p>
    `;
    imageListEl.append(card);
  }
}

searchEl.addEventListener('input', (event) => {
  state.query = event.target.value;
  applyFilters();
});

sortEl.addEventListener('change', (event) => {
  state.activeSort = event.target.value;
  applyFilters();
});

typeEl.addEventListener('change', (event) => {
  state.activeType = event.target.value;
  applyFilters();
});

imageFilterEl.addEventListener('change', renderImageLibrary);

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  const rect = modal.getBoundingClientRect();
  const clickedOutside =
    event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (clickedOutside) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.open) {
    closeModal();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });
}

loadData();
