import './css/styles.css';
import { Notify } from 'notiflix';
import ImageApiService from './imageApiService';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const refs = {
  formEl: document.querySelector('.search-form'),
  btnLoadMore: document.querySelector('.load-more'),
  btnSubmit: document.querySelector('.submit'),
  galleryImg: document.querySelector('.gallery'),
  scrollContainer: document.querySelector('.scroll-container'),
  loaderTarget: document.querySelector('.loaderTarget'),
};

window.addEventListener('scroll', throttle(onScrollGallery, 500));
refs.formEl.addEventListener('submit', onSearch);
refs.btnLoadMore.addEventListener('click', onLoadMore);

Notify.init({ timeout: 1500 });

const lightbox = new SimpleLightbox('.gallery a');
const imageApiService = new ImageApiService();
let bottomReached = false;

async function onSearch(e) {
  e.preventDefault();

  imageApiService.resetPage();
  bottomReached = false;
  showLoading();

  imageApiService.quvery = e.currentTarget.elements.searchQuery.value;
  let inputValue = imageApiService.quvery.toLowerCase().trim();

  if (inputValue === '') {
    Notify.info('Please, enter data');
    hideLoading();
  } else {
    try {
      const backEndFiles = await imageApiService.fetchArticles();

      clearArticleContainer();
      createArticleContainer(backEndFiles);

      if (imageApiService.totalHits !== 0) {
        Notify.info(`Hooray! We found ${imageApiService.totalHits} images.`);
      }

      if (!imageApiService.totalHits) {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        hideLoading();
      }

      scrollTop();
      lightbox.refresh();
    } catch (error) {
      console.log(error);
    }
  }
}

async function onLoadMore() {
  if (bottomReached) {
    hideLoading();
    return;
  }
  showLoading();

  const backEndFiles = await imageApiService.fetchArticles();
  createArticleContainer(backEndFiles);

  lightbox.refresh();

  if (imageApiService.totalHits <= imageApiService.getNumELPage()) {
    bottomReached = true;
    Notify.info(`We're sorry, but you've reached the end of search results.`);
    hideLoading();
    return;
  }
}
function createGalleryCards(hits) {
  const markup = hits
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card" >
    <a href="${largeImageURL}" class="gallery__link" ">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" class="gallery__image"/>
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        <span>${likes}</span>
      </p>
      <p class="info-item">
        <b>Views</b>
        <span>${views}</span>
      </p>
      <p class="info-item">
        <b>Comments</b>
        <span>${comments}</span>
      </p>
      <p class="info-item">
        <b>Downloads</b>
        <span>${downloads}</span>
      </p>
    </div>
  </div>`
    )
    .join('');

  return markup;
}
function createArticleContainer(hits) {
  const createGalery = createGalleryCards(hits);
  refs.galleryImg.insertAdjacentHTML('beforeend', createGalery);
}

function clearArticleContainer() {
  refs.galleryImg.innerHTML = '';
}

function onScrollGallery() {
  const documentRect = document.documentElement.getBoundingClientRect();

  if (documentRect.bottom < document.documentElement.clientHeight + 150) {
    onLoadMore();
  }
}
function scrollTop() {
  const { top: cardTop } = refs.galleryImg.getBoundingClientRect();
  window.scrollBy({
    top: cardTop - 100,
    behavior: 'smooth',
  });
}
function showLoading() {
  // refs.btnLoadMore.classList.remove('is-hidden');
  refs.loaderTarget.classList.add('loader');
}

function hideLoading() {
  refs.btnLoadMore.classList.add('is-hidden');
  refs.loaderTarget.classList.remove('loader');
}
