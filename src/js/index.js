// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import {elements, showLoader, removeLoader} from './views/base';

/***
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked Recipes 
 ***/

const state = {};
/**
 * Search controller
 */

const controlSearch = async () => {
    // 1. Get query from the view
    const query = searchView.getInput();
    console.log(query);

    if(query) {
        // 2. New search object and add it to state.
        state.search = new Search(query);
        
        // 3. Prepare UI for result
        searchView.clearInput();
        searchView.clearResult();
        showLoader(elements.searchRes);

        try {
            // 4. Search for recipes.
            await state.search.getResults();
    
            // 5. Show results on UI
            removeLoader(); 
            searchView.showResult(state.search.result);
        } catch (err) {
            console.log('not correct search');
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch(); 
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest(`.btn-inline`);
    if (btn) {
        searchView.clearResult();
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.showResult(state.search.result, goToPage);
        //console.log(goToPage);  
    }
});

/**
 * Recipe controller
 */
const controlRecipe = async () => {
    const id = window.location.hash.replace('#','');
    if (id) {

        // Prepare UI for changes.
        recipeView.clearRecipe();
        showLoader(elements.recipe);
        
        // Highlight Selected link
        if (state.search) searchView.highlightSelected(id);

        //create new Recipe object.
        state.recipe = new Recipe(id);

        try {
            // Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
            // Calculate servings and time.
            state.recipe.calcTime();
            state.recipe.calcServing();
    
            // Show Recipe 
            removeLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));

        } catch (error) {
            alert('error processing recipe');
        }
    }
}

 //window.addEventListener('hashchange', controlRecipe);
 //window.addEventListener('load' , controlRecipe);
 /**
  * List Controller
  */

function controlList () {
    // Create new list if none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count , el.unit, el.ingredient); 
        listView.renderItem(item);
    })
}

/**
*  Likes Controller
*/

function controlLike () {
    const currentID = state.recipe.id;

    if(!state.likes) state.likes = new Likes();

    // User has not yet liked Recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to state
        const newLike = state.likes.addLike(currentID , state.recipe.title ,state.recipe.author, state.recipe.img);


        // toggle the like button
        likesView.toggleLikeBtn(state.likes.isLiked(currentID));

        // Add to UI
        likesView.renderLike(newLike);
    } 

    // User has liked Recipe
    else {
        // Remove like to state
        state.likes.removeLike(currentID);
        
        // toggle the like button
        likesView.toggleLikeBtn(state.likes.isLiked(currentID));

        // Remove from UI
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());

}

// restore liked recipies on page reload 

window.addEventListener('load', () => {
    state.likes = new Likes();

    // restore likes
    state.likes.readStorage();

    // toggle like button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

['hashchange', 'load'].forEach(event => window.addEventListener(event , controlRecipe));

elements.shoppingList.addEventListener('click' , e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // handle delete event
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        
        //delete from state
        state.list.deleteItem(id);

        // delete from UI 
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id , val)
    }
});

 
 elements.recipe.addEventListener('click' , e => {
    
    if (e.target.matches('.btn-decrease , .btn-decrease *')) {
        if (state.recipe.serving > 1) {
            state.recipe.updateServings ('dec');
            recipeView.updateServingIngredient (state.recipe);
        }    
    } 

    else if (e.target.matches('.btn-increase , .btn-increase *')) {
        if (state.recipe.serving < 8)
        state.recipe.updateServings ('inc');
        recipeView.updateServingIngredient (state.recipe);
    }

    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }

    else if (e.target.matches('.recipe__love , .recipe__love *')) {
        controlLike();
    }
     
 });
