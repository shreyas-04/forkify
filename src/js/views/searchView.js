import {elements} from './base';

export const getInput = () => elements.searchInput.value; 

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResult = () => {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const showResult = (recipes ,page = 1 , resPerPage = 10) => {
    
    // Show results of current page.
    const start = (page - 1) * resPerPage ,
    end = start + 10;

    recipes.slice(start , end).forEach(showRecipe);

    // Show pagination
    showButton(page, recipes.length, resPerPage)
};

export const highlightSelected = id => {
    const arrRes = Array.from(document.querySelectorAll('.results__link'));
    arrRes.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
};

const showRecipe = recipe => {
    const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipe(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>
    `;

    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};

const showButton = (page , numResults , resPerPage) => {
    const pages = Math.ceil(numResults/resPerPage);
    let button;

    if (page === 1 && pages > 1) {
        button = createButton(page , 'next');    //button next page.
    }
    else if (page === pages && pages > 1) {
        button = createButton(page , 'prev');    //last page button.
    }
    else if (page < pages)  {
        button = `
        ${createButton(page , 'next')}
        ${createButton(page , 'prev')}
        `;    //next page & prev page.
    }

    elements.searchResPages.insertAdjacentHTML('afterbegin', button)
};

// type will be 'prev' or 'next'.
const createButton = (page , type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${ type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>
`;

export const limitRecipe = (title , limit = 17) => {
    const newTitle = [];
    if (title.length > limit ) {
        title.split(' ').reduce((acc,cur) => {
            if (acc + cur.length <= limit) {
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        return `${newTitle.join(' ')} ... `;
    } 
    
    return title;
};