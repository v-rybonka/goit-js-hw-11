import axios from 'axios';
export default class ImageApiService {
  constructor() {
    this.searchQuvery = '';
    this.page = 1;
    this.pagePer = 40;
    this.totalHits = 0;
  }

  async fetchArticles() {
    const API_KEY = '29770262-893fd435ac33616a29d285b38';
    const URL = 'https://pixabay.com/api/?key=';

    const response = await axios.get(
      `${URL}${API_KEY}&q=${this.searchQuvery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`
    );
    this.totalHits = response.data.totalHits;
    this.page += 1;

    if (!response.data.hits) {
      throw new Error('Error');
    }
    return response.data.hits;
  }

  resetPage() {
    this.page = 1;
  }

  get quvery() {
    return this.searchQuvery;
  }

  set quvery(newQuvery) {
    this.searchQuvery = newQuvery;
    this.resetPage();
  }

  getNumELPage() {
    return this.page * this.pagePer;
  }
}
