// Utility query methods
let qs = (q, el = document) => el.querySelector(q);
let qsa = (q, el = document) => Array.from(el.querySelectorAll(q));

// Find the application/ld+json
let scripts = qsa('script[type="application/ld+json"]');
let host = location.host.replaceAll(/^www\./g, '');
let data;

loop:
for (let script of scripts) {
  try {
    // Try to parse each script as json
    let json = JSON.parse(script.innerHTML);
    
    console.log('Parsed script', json);
    
    if (Array.isArray(json['@type'])) {
      json['@type'] = json['@type'][0];
    }
    
    if ((!json['@type'] || json['@type'].toLowerCase() !== 'recipe') && json['@graph']) {
      json = json['@graph'];
    }
    
    // Ensure it's an array
    if (!Array.isArray(json)) {
      json = [json];
    }
    
    // Find the recipe schema
    for (let schema of json) {
      console.log('Checking schema', schema);
      
      // Ensure @type is not an array
      if (Array.isArray(schema['@type'])) {
        schema['@type'] = schema['@type'][0];
      }
      
      if (schema['@type'].toLowerCase() === 'recipe') {
        console.log('Recipe found', schema);
        
        // Ensure formats
        if (Array.isArray(schema.image)) {
          let first = schema.image[0];
          schema.image = first.url || first;
        } else {
          schema.image = schema.image.url || schema.image;
        }
        
        if (!Array.isArray(schema.recipeInstructions)) {
          // Split single line instructions by newline
          schema.recipeInstructions = schema.recipeInstructions
            .split(/\n+/g)
            .map(s => ({text: s}));
        }
        
        data = schema;
        break loop;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

// Use the markup version if no ld+json
if (!data) {
  let el =
    qs('[itemtype="http://schema.org/Recipe"]') ||
    qs('[itemtype="https://schema.org/Recipe"]');
  if (el) {
    data = {
      name: qs('[itemprop="name"]', el).innerText,
      description: '',
      image:
        qs('meta[itemprop="image"]')?.content ||
        qs('[property="og:image"]')?.content,
      recipeIngredient:
        qsa('[itemprop="recipeIngredient"],[itemprop="ingredient"]', el)
        .map(el => el.innerText),
      recipeInstructions:
        qsa('li[itemprop="recipeInstructions"],[itemprop="recipeInstructions"] p,[itemprop="recipeInstructions"] li,[itemprop="instructions"] p', el)
        // Filter instructions with children (should only have text)
        .filter(el => !el.querySelector('*'))
        .map(el => ({text: el.innerText}))
    };
  }
}

// Exceptions for sites
if (data) {

  if (host === 'delish.com') {
    // https://www.delish.com/cooking/recipe-ideas/a28626172/how-to-cook-boneless-chicken-thigh-oven-recipe/
    data.recipeInstructions =
      qsa('div[class="direction-lists"] li')
      .map(el => ({ text: el.innerText }));
  }

  else if (host === 'bettycrocker.com') {
    // https://www.bettycrocker.com/recipes/gold-medal-flour-classic-biscuits/1e6f1425-0362-4782-893e-3b2930003193
    let ingredients = qsa('.recipePartIngredient');
    ingredients = ingredients.length ? ingredients : qsa('.ingredients-item-name');
    data.recipeIngredient = ingredients
      .map(el => el.innerText)
      .filter(text =>
        text &&
        !text.toLowerCase().includes('advertisement') &&
        !text.toLowerCase().includes('add all ingredients to list')
      );
    
    data.recipeInstructions = qsa('.recipePartStep .recipePartStepDescription')
      .map(el => ({ text: el.innerText }));
  }

  else if (host === 'epicurious.com') {
    // https://www.epicurious.com/recipes/food/views/fried-rice-354350
    if (!data.recipeIngredient.length) {
      data.recipeIngredient =  qsa('li[itemprop="ingredients"]').map(el => el.innerText);
    }
  }

  else if (host === 'thepioneerwoman.com') {
    // https://www.thepioneerwoman.com/food-cooking/recipes/a9422/my-favorite-christmas-cookies-from-childhood-and-beyond/
      data.recipeInstructions =  qsa('.direction-lists li').map(el => ({text: el.innerText}));
  }
}

if (data) {
  // Remove markup in ingredients
  data.recipeIngredient = data.recipeIngredient.map(
    i => i.replaceAll(/<.+?>/g, ' ')
  );

  // Remove leading step numbers in instructions
  data.recipeInstructions = data.recipeInstructions.map(
    i => ({
      text: (i.text || i).replace(/^\d+\.\s*?/, '')
    })
  );
  
  // Render the recipe
  document.body.innerHTML =
`
<div class="recipe-image"><img src="${data.image}" alt="An image of ${data.name}" /></div>

<h1>${data.name}</h1>

${data.description ? `<p><i>${data.description}</i></p>` : ''}

<h2>Ingredients</h2>
<ul class="ingredients-list">
${data.recipeIngredient.reduce((prev, curr) => prev +
  `<li>${curr}</li>`
  , '')}
  </ul>
  
<h2>Directions</h2>
<ol style="margin:0.125in; padding:0; overflow: visible; display: block">
${data.recipeInstructions.reduce((prev, curr) => prev +
  `<li>${curr.text}<br></li>`
  , '')}
</ol>

<a href="${window.location}">${window.location}</a>
`;


  // Clear all the styles
  qsa('style, link[rel="stylesheet"]')
  .map(el => el.parentNode.removeChild(el));


  // Add custom styles
  document.head.insertAdjacentHTML('beforeend',
`
<style type="text/css">
* {
  box-sizing: border-box;
}
:root, html, body {
  background: #f2f2f2;
  color: #444444;
  text-shadow: 0 1px 0 #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6181;
  margin: 0;
  padding: 0;
  height: 100%; /* Fallback */
  height: 100vh;
  width: 100%; /* Fallback */
  width: 100vw;
}

body {
  margin: 1rem auto;
  width: 90%;
}

h1 {
  font-size: 2rem;
}

p {
  font-size: 1rem;
}

a {
  color: #444444;
  text-decoration: none;
}

@media screen and (min-width: 480px) {
  body {
    max-width: 800px;
  }
}
@media screen and (min-width: 1220px) {
  :root, html, body {
    font-size: 18px;
  }
  body {
    max-width: 1000px;
  }
}

a {
  border-bottom: 1px solid #444444;
  color: #444444;
  text-decoration: none;
}
a:hover {
  border-bottom: 0;
}

.recipe-image {
  font-size: 0;
}

.recipe-image img {
  width: 100%;
}

li {
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}

.ingredients-list {
  columns: 1;
  padding-left: 2rem;
}

@media screen and (min-width: 480px) {
  .recipe-image {
    float: right;
    margin: 0.75rem;
  }
  .recipe-image img {
    width: 250px;
  }
}
@media screen and (min-width: 660px) {
  .ingredients-list {
    columns: 2;
  }
}
@media screen and (min-width: 1220px) {
  .ingredients-list {
    columns: 3;
  }
}

/* Print styles */
@media print {
  @page {
    size: 6in 4in landscape;
    margin: 0.125in;
  }
  body {
    color: black;
    width: 6in;
    height: 4in;
    margin: 0.125in;
    font-size: 9pt;
    line-height: 1.2;
    overflow: visible;
    font-family: Helvetica, sans-serif;
  }
  h1 {
    font-size: 10pt;
    font-weight: bold;
  }
  h2 {
    display: none;
  }
  img {
    display: none;
  }
  a {
    color: black;
    text-decoration: none
  }
  body {
    margin: 0;
    padding: 0;
    max-width: auto;
    width: 100%;
  }
  .ingredients-list {
    columns: 3;
    column-gap: 0.2in;
    padding-left: 0.125in;
  }
}
</style>
`);
} else {
  console.log('No recipe found');
}
