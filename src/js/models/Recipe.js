import axios from 'axios';
import {key , proxy} from '../config';
var safeEval = require('safe-eval')

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }
        catch (error){
            console.log(error);
            alert('something went wrong :(')
        }
    }

    calcTime () {
        const numIng = (this.ingredients).length;
        const periods = Math.ceil(numIng/3);
        this.time = periods * 15;
    }

    calcServing () {
        this.serving = 4;
    } 

    parseIngredients () {
        const unitLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce' ,'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp' , 'tsp', 'cup', 'pound' ];
        const unit = [...unitShort, 'kg' , 'g'];

        const newIngredients = this.ingredients.map(el => {
            
            // 1. Units
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShort[i]);
            })
            // 2. remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

            // 3.parse Ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => unit.includes(el2));

            let objIng;

            if (unitIndex > -1) {
                // there is a unit
                const arrCount = arrIng.slice(0 , unitIndex);


                let count;
                if(arrCount.length === 1) {
                    count = safeEval(arrIng[0]);
                }
                else {
                    count = safeEval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
            }
            else if (parseInt(arrIng[0], 10)) {
                // No unit but first element is a number
                objIng = {
                    count :parseInt(arrIng[0], 10),
                    unit : '',
                    ingredient : arrIng.slice(1).join(' ')
                };
            }
            else if (unitIndex === -1) {
                // there is no unit and no number
                objIng = {
                    count: 1,
                    unit : '',
                    ingredient
                };
            }

            return objIng;
        });
        this.ingredients = newIngredients;
    }

    updateServings (type) {
        const newServings = type === 'dec' ? this.serving - 1 : this.serving + 1 ;

        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.serving ) 
        });

        this.serving = newServings;
    }
}