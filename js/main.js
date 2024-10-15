'use strict';

const login = document.getElementById('login');
const loginButton = document.getElementById('login-button');
const loginDescription = document.querySelector('.login__description');
const logoutButton = document.getElementById('logout');
const page = document.querySelector('.page');
const header = document.querySelector('.header');
const aside = document.querySelector('.aside');
const asideContent = document.querySelector('.aside-content');
const main = document.querySelector('.main');
const footer = document.querySelector('.footer');
const user = document.querySelector('.user__button');
const playlistList = document.querySelector('.playlist-songs__list');
const viewCompactButton = document.querySelector('.view__compact-button');
const viewListButton = document.querySelector('.view__list-button');
const sortButton = document.querySelector('.sort__button');
const sortContentPopup = document.querySelector('.sort-content');
const sortContentButtons = document.querySelectorAll('.sort-content__button');
const sortContentButtonDefault = document.querySelector('.sort-content__button[data-sort-default]');
const sortContentButtonDate = document.querySelector('.sort-content__button[data-sort-date]');
const sortContentButtonName = document.querySelector('.sort-content__button[data-sort-name]');
const scrollUpButton = document.querySelector('.scroll-up-button');
const headerPlaylistName = document.querySelector('.header__playlist-name');
const headerPlaylistSongsAmount = document.querySelector('.header__playlist-songs-amount');
const libraryOtherPlaylistsText = document.querySelector('.library__other-playlists-text');
const libraryOtherPlaylistsList = document.querySelector('.library__other-playlists-list');
const likedSongsButton = document.querySelector('.library__liked-songs-button');

let sortArray = [];
let sortDefaultArray = [];
let touchStartX = 0;
let checkPlaylistButton = false;

function mediaWidth(targetValue) {
    const htmlBaseFontSize =
        parseFloat(window.getComputedStyle(document.documentElement).fontSize) * 1.6;
    targetValue = (parseFloat(targetValue) / 16) * 10;
    return Math.floor(targetValue * Math.floor(htmlBaseFontSize));
}

function openAside() {
    aside.classList.add('active');
    aside.classList.remove('aside-swipe-animation');
    document.body.classList.add('no-scroll');
    page.classList.add('backdrop');

    for (const item of page.children) {
        if (!item.classList.contains('aside')) {
            item.setAttribute('inert', '');
        }
    }
}

function closesAside() {
    aside.classList.remove('active');
    document.body.classList.remove('no-scroll');
    page.classList.remove('backdrop');

    for (const item of page.children) {
        if (!item.classList.contains('aside')) {
            item.removeAttribute('inert');
        }
    }
}

window.addEventListener('resize', () => {
    main.style.marginTop = header.offsetHeight + 'px';

    if (sortContentPopup.classList.contains('active')) {
        sortContentPopup.classList.remove('active');
    }

    if (window.innerWidth > mediaWidth('107rem') && aside.classList.contains('active')) {
        closesAside();
    }
});

window.addEventListener('scroll', () => {
    if (sortContentPopup.classList.contains('active')) {
        sortContentPopup.classList.remove('active');
    }

    if (window.scrollY >= 100) {
        scrollUpButton.classList.add('active');
        scrollUpButton.removeAttribute('disabled');
        scrollUpButton.removeAttribute('aria-disabled');
    } else {
        scrollUpButton.classList.remove('active');
        scrollUpButton.setAttribute('disabled', '');
        scrollUpButton.setAttribute('aria-disabled', 'true');
    }
});

scrollUpButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
});

document.addEventListener('click', event => {
    if (sortContentPopup.classList.contains('active')) {
        sortContentPopup.classList.remove('active');
    }

    if (
        window.innerWidth <= mediaWidth('107rem') &&
        aside.classList.contains('active') &&
        (!event.target.closest('.aside') || event.target.closest('button'))
    ) {
        closesAside();
    }
});

user.addEventListener('click', event => {
    event.stopPropagation();

    if (sortContentPopup.classList.contains('active')) {
        sortContentPopup.classList.remove('active');
    }

    if (window.innerWidth <= mediaWidth('107rem')) {
        aside.classList.toggle('active') ? openAside() : closesAside();
    }
});

sortButton.addEventListener('click', event => {
    event.stopPropagation();

    if (window.innerWidth <= mediaWidth('107rem') && aside.classList.contains('active')) {
        closesAside();
    }

    sortContentPopup.classList.toggle('active');
    sortContentPopup.style.top = sortButton.getBoundingClientRect().top + 'px';
    sortContentPopup.style.left =
        sortButton.offsetWidth + sortButton.getBoundingClientRect().left + 10 + 'px';
});

sortContentPopup.addEventListener('click', event => {
    event.stopPropagation();
});

asideContent.addEventListener('scroll', () => {
    sortContentPopup.classList.remove('active');
});

aside.addEventListener('touchstart', event => {
    if (window.innerWidth <= mediaWidth('107rem') && !aside.classList.contains('active')) {
        touchStartX = event.changedTouches[0].screenX;
    }
});

aside.addEventListener('touchmove', event => {
    if (sortContentPopup.classList.contains('active')) {
        sortContentPopup.classList.remove('active');
    }

    if (
        window.innerWidth <= mediaWidth('107rem') &&
        !aside.classList.contains('active') &&
        event.changedTouches[0].screenX > touchStartX + 60
    ) {
        openAside();
    }
});

viewCompactButton.addEventListener('click', () => {
    if (viewCompactButton.classList.contains('active')) return;
    viewCompactButton.classList.add('active');
    viewListButton.classList.remove('active');
    playlistList.classList.remove('view-list');
});

viewListButton.addEventListener('click', () => {
    if (viewListButton.classList.contains('active')) return;
    viewListButton.classList.add('active');
    viewCompactButton.classList.remove('active');
    playlistList.classList.add('view-list');
});

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorage(key) {
    if (localStorage.getItem(key)) return JSON.parse(localStorage.getItem(key));
}

const clientId = '98f436cbfd3a4a6bb6ad4fda6427b451';
const redirectUri = 'https://hea7enandhell.github.io/Spotify-search/';

const scopes =
    'user-library-read user-read-private user-read-email playlist-read-private playlist-read-collaborative';

loginButton.addEventListener('click', () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
        redirectUri,
    )}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = url;
});

logoutButton.addEventListener('click', () => {
    localStorage.removeItem('accessToken');

    const spotifyLogoutUrl = 'https://accounts.spotify.com/logout';
    const spotifyLogoutWindow = window.open(
        spotifyLogoutUrl,
        'Spotify Logout',
        'width=500,height=500,top=40,left=40',
    );

    setTimeout(() => {
        spotifyLogoutWindow.close();
        window.location.href = redirectUri;
    }, 2000);
});

function getAccessToken() {
    const hash = window.location.hash;
    let accessToken = getLocalStorage('accessToken');

    if (hash) {
        accessToken = new URLSearchParams(hash.substring(1)).get('access_token');
        setLocalStorage('accessToken', accessToken);
        window.location.hash = '';
    }

    return accessToken;
}

window.addEventListener('load', async () => {
    const accessToken = getAccessToken();

    if (accessToken) {
        playlistList.innerHTML = '';
        libraryOtherPlaylistsList.innerHTML = '';

        const { userName, userImage, userImageFail } = await getUserProfile(accessToken);
        console.log('getUserProfile:', userName, userImage, userImageFail);
        document.querySelector('.user__name').textContent = userName;
        document.querySelector('.user__image').outerHTML = userImage ? userImage : userImageFail;
        aside.classList.remove('hidden');

        getUserPlaylists(accessToken);
        await getPlaylistTracks(accessToken);
    } else {
        login.classList.remove('hidden');
    }
});

window.addEventListener('click', async event => {
    if (
        event.target.closest('.library__playlist-button') &&
        !event.target.closest('.library__playlist-button.active') &&
        !event.target.closest('.library__liked-songs-button') &&
        checkPlaylistButton
    ) {
        checkPlaylistButton = false;
        const accessToken = getAccessToken();
        const pLaylistButton = event.target.closest('.library__playlist-button');
        const playlistId = pLaylistButton.dataset.playlistId;
        const pLaylistName = pLaylistButton.querySelector('.library__playlist-name').textContent;

        document.querySelectorAll('.library__playlist-button').forEach(button => {
            button.classList.remove('active');
        });
        pLaylistButton.classList.add('active');

        sortContentButtons.forEach(item => {
            item.classList.remove('active', 'reverse');
        });
        sortContentButtonDefault.classList.add('active');

        header.classList.add('hidden');
        headerPlaylistName.textContent = pLaylistName;
        playlistList.innerHTML = '';
        sortArray = [];
        sortDefaultArray = [];
        await getPlaylistTracks(accessToken, `playlists/${playlistId}`);
    }
});

likedSongsButton.addEventListener('click', async () => {
    if (likedSongsButton.classList.contains('active') || !checkPlaylistButton) return;

    checkPlaylistButton = false;
    const accessToken = getAccessToken();

    document.querySelectorAll('.library__playlist-button').forEach(button => {
        button.classList.remove('active');
    });
    likedSongsButton.classList.add('active');

    sortContentButtons.forEach(item => {
        item.classList.remove('active', 'reverse');
    });
    sortContentButtonDefault.classList.add('active');

    header.classList.add('hidden');
    headerPlaylistName.textContent = likedSongsButton.textContent;
    playlistList.innerHTML = '';
    sortArray = [];
    sortDefaultArray = [];
    await getPlaylistTracks(accessToken);
});

async function fetchWebApi(accessToken, endpoint) {
    const res = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 401) {
        loginDescription.textContent = 'Please sign in again';
        aside.classList.add('hidden');
        header.classList.add('hidden');
        main.classList.add('hidden');
        footer.classList.add('hidden');
        login.classList.remove('hidden');
        return false;
    }

    return res;
}

async function getUserProfile(accessToken) {
    const result = await fetchWebApi(accessToken, 'me');
    if (result === false) return false;
    const data = await result.json();
    return {
        userName: data.display_name,
        userImage: data.images[1]
            ? `<img src="${data.images[1].url}" alt="User image" class="user__image">`
            : null,
        userImageFail: `
            <source srcset="./images/user-image.avif" type="image/avif">
            <source srcset="./images/user-image.webp" type="image/webp">
            <img src="./images/user-image.png" alt="User image" class="user__image">
        `,
    };
}

async function getPlaylistTracks(accessToken, playlist = 'me', offset = 0, limit = 50) {
    const result = await fetchWebApi(
        accessToken,
        `${playlist}/tracks?offset=${offset}&limit=${limit}`,
    );
    if (result === false) return;
    const data = await result.json();

    const res = {
        number: offset,
        totalTracks: data.total,
        tracks: data.items,
    };

    if (header.classList.contains('hidden')) {
        headerPlaylistSongsAmount.textContent = data.total;
        header.classList.remove('hidden');
        main.style.marginTop = header.offsetHeight + 'px';
        main.classList.remove('hidden');
        footer.classList.remove('hidden');
    }

    renderTrackList(res);

    if (data.total <= offset + limit) {
        checkPlaylistButton = true;
        return;
    }

    return getPlaylistTracks(accessToken, playlist, offset + limit, limit);
}

async function getUserPlaylists(accessToken) {
    const result = await fetchWebApi(accessToken, 'me/playlists?limit=50');
    if (result === false) return;
    const data = await result.json();
    if (data.total < 1) {
        libraryOtherPlaylistsText.textContent = 'No playlists';
        return;
    }

    libraryOtherPlaylistsText.remove();
    data.items.forEach(item => {
        libraryOtherPlaylistsList.insertAdjacentHTML('beforeend', renderPlaylistButton(item));
    });
}

async function getUserPlaylistTracks(accessToken, playlistId) {
    const result = await fetchWebApi(accessToken, `playlists/${playlistId}/tracks?limit=50`);
    if (result === false) return;
    return await result.json();
}

function msToHhMmSs(ms) {
    const seconds = Math.round((ms / 1000) % 60)
        .toString()
        .padStart(2, '0');
    const minutes = Math.floor((ms / (1000 * 60)) % 60)
        .toString()
        .padStart(2, '0');
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
        .toString()
        .padStart(2, '0');

    return `${hours !== '00' ? hours + ':' : ''}${minutes}:${seconds}`;
}

function trackNameToLink(artists, name) {
    const res = `${artists.replace(/,/g, '')} ${name.replace(/,/g, '')} download`;
    return `https://www.google.com.ua/search?q=${encodeURIComponent(res)}`;
}

function renderTrackList({ totalTracks, tracks, number }) {
    tracks.forEach(({ added_at, track }, index) => {
        const res = {
            trackAdded: added_at,
            trackNumber: (number + index + 1)
                .toString()
                .padStart(totalTracks.toString().length, '0'),
            trackArtists: track.artists.map(item => item.name).join(', '),
            trackName: track.name,
            trackImage: track.album.images[1].url,
            trackDuration: msToHhMmSs(track.duration_ms),
        };

        sortArray.push(res);
        sortDefaultArray.push(res);

        playlistList.insertAdjacentHTML('beforeend', renderTrack(res));
    });
}

function renderTrack({ trackNumber, trackImage, trackDuration, trackArtists, trackName }) {
    return `
        <li class="playlist-songs__item">
            <div class="playlist-songs__image-wrap">
                <img class="playlist-songs__image"
                    src="${trackImage}" alt="Image">
            </div>
            <div class="playlist-songs__item-content">
                <div class="playlist-songs__number-wrap">
                    <p class="playlist-songs__number">${trackNumber}</p>
                    <p class="playlist-songs__duration">${trackDuration}</p>
                </div>
                <div class="playlist-songs__song">
                    <p class="playlist-songs__song-artists">${trackArtists}</p>
                    <p class="playlist-songs__song-title">${trackName}</p>
                </div>
                <a href="${trackNameToLink(trackArtists, trackName)}"
                    target="_blank" class="playlist-songs__link" aria-label="search ${trackArtists} ${trackName}">Search</a>
            </div>
        </li>
    `;
}

function renderPlaylistButton({ id, images, name }) {
    return `
        <li class="library__other-playlists-item">
            <button type="button" class="library__playlist-button" data-playlist-id="${id}">
                <img src="${
                    images ? images[0].url : './images/music-note.png'
                }" alt="Image" class="library__playlist-image">
                <h4 class="library__playlist-name">${name}</h4>
            </button>
        </li>
    `;
}

sortContentButtonDefault.addEventListener('click', () => {
    if (!checkPlaylistButton || sortContentButtonDefault.classList.contains('active')) return;

    sortContentButtons.forEach(item => {
        item.classList.remove('active', 'reverse');
    });
    sortContentButtonDefault.classList.add('active');
    updatePlaylistList(sortDefaultArray);
});

sortContentButtonDate.addEventListener('click', () => {
    sortButtonAction(sortContentButtonDate, sortByDate);
});

sortContentButtonName.addEventListener('click', () => {
    sortButtonAction(sortContentButtonName, sortByName);
});

function sortButtonAction(sortButton, sortFunction) {
    if (!checkPlaylistButton) return;

    const isActive = sortButton.classList.contains('active');
    if (!isActive) {
        sortContentButtons.forEach(item => {
            item.classList.remove('active', 'reverse');
        });
        sortButton.classList.add('active');
    }
    if (isActive) {
        sortButton.classList.toggle('reverse');
    }
    sortArray.sort(sortFunction);

    const isReverse = sortButton.classList.contains('reverse');
    if (isReverse) {
        sortArray.reverse();
    }

    updatePlaylistList(sortArray);
}

function updatePlaylistList(array) {
    playlistList.innerHTML = '';
    array.forEach((item, index, arr) => {
        item.trackNumber = (index + 1).toString().padStart(arr.length.toString().length, '0');
        playlistList.insertAdjacentHTML('beforeend', renderTrack(item));
    });
}

function sortByName(a, b) {
    const res = a.trackArtists.localeCompare(b.trackArtists);
    return res !== 0 ? res : a.trackName.localeCompare(b.trackName);
}
function sortByDate(a, b) {
    return a.trackAdded.localeCompare(b.trackAdded);
}

const { createFocusTrap } = window.focusTrap;

const focusTrap = createFocusTrap(sortContentPopup, {
    onActivate: () => {},
    onDeactivate: () => {
        sortContentPopup.classList.remove('active');
    },
    escapeDeactivates: true,
    clickOutsideDeactivates: true,
});

sortButton.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (window.innerWidth <= mediaWidth('107rem') && aside.classList.contains('active')) {
            closesAside();
        }

        sortContentPopup.classList.add('active');
        sortContentPopup.style.top = sortButton.getBoundingClientRect().top + 'px';
        sortContentPopup.style.left =
            sortButton.offsetWidth + sortButton.getBoundingClientRect().left + 10 + 'px';
        focusTrap.activate();
    }
});

window.addEventListener('load', () => {
    document.body.classList.remove('js-stop-transition');
});
