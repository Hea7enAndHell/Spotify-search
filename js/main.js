'use strict';
const clientId = '98f436cbfd3a4a6bb6ad4fda6427b451';
const redirectUri = 'https://hea7enandhell.github.io/Spotify-search/';
const scopes =
    'user-library-read user-read-private user-read-email playlist-read-private playlist-read-collaborative';

let accessToken = '';

const loginButton = document.getElementById('login__button');
loginButton.addEventListener('click', () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
        redirectUri,
    )}&scope=${scopes}`;
    window.location.href = url;
});

const loading = document.querySelector('.loading');
const listWrapTop = document.querySelector('.list-wrap__top');
let currentPlaylist = [];
let currentDefaultPlaylist = [];

window.addEventListener('load', async () => {
    const login = document.querySelector('.login');
    const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((acc, item) => {
            if (item) {
                const parts = item.split('=');
                acc[parts[0]] = decodeURIComponent(parts[1]);
            }
            return acc;
        }, {});

    if (hash.access_token) {
        accessToken = hash.access_token;

        login.remove();
        const listWrap = document.querySelector('.list-wrap');
        listWrap.classList.remove('hidden');
        loading.classList.add('active');

        const [userName, userImage] = await getUsers();
        const userImageBlock = document.querySelector('.user__image');
        const userNameBlock = document.querySelector('.user__name');
        const asideInner = document.querySelector('.aside-inner');
        const list = document.querySelector('.list');
        list.innerHTML = '';
        userImageBlock.src = userImage;
        userNameBlock.textContent = userName;
        asideInner.classList.add('active');
        viewButton();

        const libraryWrap = document.querySelector('.library-wrap');
        libraryWrap.classList.add('active');
        const playlists = document.querySelector('.playlists');
        const [usersPlaylists] = await getUsersPlaylists();
        await getUsersPlaylistsTrack('me');

        if (usersPlaylists.length === 0) return;

        document.querySelector('.playlists__description').remove();

        usersPlaylists.forEach(({ name, images, id }) => {
            const playlistsButton = `
                        <button type="button" class="playlists__button" data-id="${id}">
                            <img src="${
                                images ? images[0].url : './images/music-note.png'
                            }" alt="Image" class="playlists__image">
                            <p class="playlists__text">${name}</p>
                        </button>
                    `;
            playlists.insertAdjacentHTML('beforeend', playlistsButton);
        });

        playlistClick();
    } else {
        login.classList.add('active');
    }
});

async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        method,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        console.error(`Error: ${res.status} ${res.statusText}`);

        if (res.status === 401) {
            console.error('Access token is invalid or expired. Redirecting to authorization...');

            window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(
                redirectUri,
            )}&scope=${scopes}`;
            return;
        }

        throw new Error(`Request failed with status ${res.status}: ${res.statusText}`);
    }

    return await res.json();
}

async function getUsers() {
    const data = await fetchWebApi(`v1/me`, 'GET');
    if (!data.images[1]) {
        return [data.display_name, './images/profile-user.png'];
    } else {
        return [data.display_name, data.images[1].url];
    }
}

function getTracksList(tracks) {
    return tracks?.map(({ track, added_at }) => ({
        artists: track.artists.map(artist => artist.name).join(', '),
        name: track.name,
        duration: msToMmSs(track.duration_ms),
        image: track.album.images[0].url,
        link: `https://www.google.com.ua/search?q=${changeString(
            track.artists.map(artist => artist.name).join(', ') + ' ' + track.name,
        )}+download&oq=${changeString(
            track.artists.map(artist => artist.name).join(', ') + ' ' + track.name,
        )}+download&sourceid=chrome&ie=UTF-8`,
        added_at,
    }));
}

async function getUsersPlaylists(result = [], currentCount = 0, limit = 50) {
    const data = await fetchWebApi(`v1/me/playlists?offset=${currentCount}&limit=${limit}`, 'GET');
    result.push(...data.items);

    if (data.items.length < limit) {
        return [result, result.length.toString().length];
    } else {
        return await getUsersPlaylists(result, currentCount + limit, limit);
    }
}

let resultPlaylistsTrack = [];
let currentCountPlaylistsTrack = 0;
let limitPlaylistsTrack = 50;
let totalPlaylistsTrack = 0;

async function getUsersPlaylistsTrack(id) {
    const data = await fetchWebApi(
        `v1/${id}/tracks?offset=${currentCountPlaylistsTrack}&limit=${limitPlaylistsTrack}`,
        'GET',
    );

    const playlistInfoCountTracks = document.querySelector('.playlist-info__count-tracks');
    if (totalPlaylistsTrack === 0) {
        totalPlaylistsTrack = data.total;
        playlistInfoCountTracks.textContent = totalPlaylistsTrack;
    }

    resultPlaylistsTrack = [...data.items];

    const playlistsTracksList = getTracksList(resultPlaylistsTrack);
    currentPlaylist.push(...playlistsTracksList);
    currentDefaultPlaylist.push(...playlistsTracksList);

    renderTracks(
        playlistsTracksList,
        currentCountPlaylistsTrack,
        totalPlaylistsTrack.toString().length,
    );
    currentCountPlaylistsTrack += limitPlaylistsTrack;

    if (data.items.length === limitPlaylistsTrack) await getUsersPlaylistsTrack(id);
}

function msToMmSs(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function changeString(str) {
    return str.match(/[а-яёa-zÀ-ÿ\d.-]+/gi).join('+');
}

function renderTracks(trackList, limit, number) {
    const list = document.querySelector('.list');
    trackList.forEach(({ artists, name, duration, image, link }, index) => {
        const nameSplit = name.split('- ');
        const newName = `${nameSplit[0].trim()}${
            nameSplit[1] === undefined ? '' : ` (${nameSplit[1]})`
        }`;

        const item = `
                <li class="item">
                    <img class="item__image" src="${image}">
                    <div class="item__content">
                        <div class="item__number-wrap">
                            <p class="item__number">${String(index + limit + 1).padStart(
                                number,
                                '0',
                            )}</p>
                            <p class="item__duration">${duration}</p>
                        </div>
                        <div class="item__track">
                            <p class="item__artists">${artists}</p>
                            <p class="item__name">${newName}</p>
                        </div>
                        <a href="${link}" target="_blank" class="item__link">Search</a>
                    </div>
                </li>
            `;
        list.insertAdjacentHTML('beforeend', item);
    });

    if (loading) loading.classList.remove('active');
    listWrapTop.classList.remove('hidden');
}

function viewButton() {
    const listContent = document.querySelector('.list');
    const buttonGrid = document.querySelector('.button-grid');
    const buttonLargeList = document.querySelector('.button-list1');
    const buttonSmallList = document.querySelector('.button-list2');

    if (buttonGrid.classList.contains('active')) {
        listContent.classList.remove('view-list1', 'view-list2');
    }
    if (buttonLargeList.classList.contains('active')) {
        listContent.classList.remove('view-list2');
        listContent.classList.add('view-list1');
    }
    if (buttonSmallList.classList.contains('active')) {
        listContent.classList.remove('view-list1');
        listContent.classList.add('view-list2');
    }
}

const viewButtons = document.querySelectorAll('.view__button');
viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('active')) return;
        viewButtons.forEach(item => {
            item.classList.remove('active');
        });
        button.classList.add('active');
        viewButton();
    });
});

const sortContentButtons = document.querySelectorAll('.sort-content__button');
let playlistStatus = true;
function playlistClick() {
    const playlistsButtons = document.querySelectorAll('.playlists__button');
    const likedSongsButton = document.querySelector('.liked-songs__button');
    playlistsButtons.forEach(button => {
        button.addEventListener('click', async () => {
            if (playlistStatus === false || button.classList.contains('active')) return;

            playlistStatus = false;
            listWrapTop.classList.add('hidden');
            loading.classList.add('active');

            playlistsButtons.forEach(item => {
                item.classList.remove('active');
            });
            button.classList.add('active');

            sortContentButtons.forEach(button => {
                button.classList.remove('active');
            });
            const sortByDefaultButton = document.querySelector(
                '.sort-content__button[data-sort-default]',
            );
            sortByDefaultButton.classList.add('active');

            const list = document.querySelector('.list');
            list.innerHTML = '';

            const playlistTitle = button.querySelector('.playlists__text');
            const playlistInfoTitle = document.querySelector('.playlist-info__title');
            playlistInfoTitle.textContent = playlistTitle.textContent;

            currentPlaylist = [];
            currentDefaultPlaylist = [];
            resultPlaylistsTrack = [];
            currentCountPlaylistsTrack = 0;
            limitPlaylistsTrack = 50;
            totalPlaylistsTrack = 0;

            const playlistId =
                button === likedSongsButton ? 'me' : `playlists/${button.dataset.id}`;
            await getUsersPlaylistsTrack(playlistId);

            playlistStatus = true;
        });
    });
}

const aside = document.querySelector('.aside');
const sortContent = document.querySelector('.sort-content');
const backgroundBlur = document.querySelector('.background-blur');

document.addEventListener('click', () => {
    sortContent.classList.remove('active');
    aside.classList.remove('active');
    backgroundBlur.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

document.addEventListener('scroll', () => {
    sortContent.classList.remove('active');
});

const sortButton = document.querySelector('.sort__button');
sortButton.addEventListener('click', event => {
    event.stopPropagation();
    sortContent.classList.toggle('active');

    if (sortContent.classList.contains('active')) {
        if (window.innerWidth < 1071) {
            sortContent.style.top = sortButton.getBoundingClientRect().top + 'px';
        }
        if (window.innerWidth > 1070) {
            sortContent.removeAttribute('style');
        }
        aside.addEventListener('scroll', () => {
            sortContent.classList.remove('active');
        });
    }
});

sortContent.addEventListener('click', event => {
    event.stopPropagation();
});
sortContent.addEventListener('touchmove', event => {
    event.stopPropagation();
});

sortContentButtons.forEach(sortButton => {
    sortButton.addEventListener('click', () => {
        if (
            playlistStatus === false ||
            (sortButton.classList.contains('active') &&
                sortButton.hasAttribute('data-sort-default'))
        )
            return;

        sortContentButtons.forEach(button => {
            if (sortButton !== button) button.classList.remove('active', 'reverse');
        });

        let tracksList = null;
        if (sortButton.hasAttribute('data-sort-default')) {
            sortButton.classList.add('active');
            tracksList = currentDefaultPlaylist;
        }

        if (sortButton.hasAttribute('data-sort-name')) {
            if (
                sortButton.classList.contains('active') &&
                sortButton.classList.contains('reverse')
            ) {
                sortButton.classList.remove('reverse');
                tracksList = currentPlaylist.sort(sortByName);
            } else if (!sortButton.classList.contains('active')) {
                sortButton.classList.add('active');
                tracksList = currentPlaylist.sort(sortByName);
            } else {
                sortButton.classList.add('reverse');
                tracksList = currentPlaylist.sort(sortByName).reverse();
            }
        }

        if (sortButton.hasAttribute('data-sort-date')) {
            if (
                sortButton.classList.contains('active') &&
                sortButton.classList.contains('reverse')
            ) {
                sortButton.classList.remove('reverse');
                tracksList = currentPlaylist.sort(sortByDate);
            } else if (!sortButton.classList.contains('active')) {
                sortButton.classList.add('active');
                tracksList = currentPlaylist.sort(sortByDate);
            } else {
                sortButton.classList.add('reverse');
                tracksList = currentPlaylist.sort(sortByDate).reverse();
            }
        }

        const list = document.querySelector('.list');
        list.innerHTML = '';

        renderTracks(tracksList, 0, totalPlaylistsTrack.toString().length);
    });
});

function sortByName(a, b) {
    const artistComparison = a.artists.localeCompare(b.artists);
    return artistComparison !== 0 ? artistComparison : a.name.localeCompare(b.name);
}

function sortByDate(a, b) {
    return b.added_at.localeCompare(a.added_at);
}

const userButton = document.querySelector('.user');
userButton.addEventListener('click', event => {
    event.stopPropagation();
    sortContent.classList.remove('active');

    if (window.innerWidth < 1071) {
        aside.classList.toggle('active');
        backgroundBlur.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 1070) {
        aside.classList.remove('active');
        backgroundBlur.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
    sortContent.classList.remove('active');
});

const logoutButton = document.querySelector('.logout');
logoutButton.addEventListener('click', () => {
    accessToken = '';
    window.location.hash = '';

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

let touchStartX = 0;
aside.addEventListener('touchstart', event => {
    if (window.innerWidth < 1071 && !aside.classList.contains('active')) {
        touchStartX = event.changedTouches[0].screenX;
    }
});

aside.addEventListener('touchmove', event => {
    if (window.innerWidth < 1071 && !aside.classList.contains('active')) {
        let touchMoveX = event.changedTouches[0].screenX;

        if (touchMoveX > touchStartX + 60) {
            aside.classList.add('active');
            backgroundBlur.classList.add('active');
            document.body.classList.add('no-scroll');
            sortContent.classList.remove('active');
        }
    }
});

// stop-transition
window.addEventListener('load', event => {
    document.body.classList.remove('js-stop-transition');
});